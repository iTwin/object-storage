/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import axios from "axios";

import {
  assertInstanceType,
  assertPrimitiveType,
} from "@itwin/cloud-agnostic-core";

import { UrlDownloadInput } from "./ClientStorage";
import {
  FrontendMultipartUploadData,
  FrontendTransferData,
  FrontendTransferType,
  Metadata,
  MultipartUploadData,
  ObjectDirectory,
  ObjectReference,
  TransferConfig,
  TransferData,
  TransferType,
} from "./StorageInterfaces";

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks = Array<Uint8Array>();
    stream.on("data", (data) =>
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export function buildObjectKey(reference: {
  baseDirectory: string;
  relativeDirectory?: string;
  objectName: string;
}): string {
  const { baseDirectory, relativeDirectory, objectName } = reference;
  return `${baseDirectory}${
    relativeDirectory ? `/${relativeDirectory}` : ""
  }/${objectName}`;
}

export function buildObjectReference(
  objectKey: string,
  separator = "/"
): ObjectReference {
  const parts = objectKey.split(separator).filter((key) => key);
  const lastIndex = parts.length - 1;

  return {
    baseDirectory: parts[0],
    relativeDirectory: parts.slice(1, lastIndex).join("/"),
    objectName: parts.length !== 1 ? parts[lastIndex] : "",
  };
}

export function buildObjectDirectoryString(directory: ObjectDirectory): string {
  const { baseDirectory, relativeDirectory } = directory;
  return `${baseDirectory}${relativeDirectory ? `/${relativeDirectory}` : ""}`;
}

interface GetTransferTimeInSecondsOptions {
  maxTransferTime?: number;
  minTransferSpeedInKbps?: number;
  padding?: number;
}
export function getTransferTimeInSeconds(
  fileSize: number,
  {
    maxTransferTime = 3600,
    minTransferSpeedInKbps = 100,
    padding = 300,
  }: GetTransferTimeInSecondsOptions = {}
): number {
  const bytesPerSecond = minTransferSpeedInKbps * 125;
  const seconds = fileSize / bytesPerSecond + padding;
  return seconds > maxTransferTime ? maxTransferTime : seconds;
}

export async function downloadFromUrlFrontendFriendly( // TODO: use
  input: UrlDownloadInput
): Promise<TransferData> {
  const { transferType, url } = input;

  switch (transferType) {
    case "buffer":
      const bufferResponse = await axios.get(url, {
        responseType: "arraybuffer",
      });
      return bufferResponse.data as Buffer;

    case "stream":
      const streamResponse = await axios.get(url, {
        responseType: "stream",
      });
      return streamResponse.data as Readable;

    default:
      throw new Error(`Type '${transferType}' is not supported`);
  }
}

export async function uploadToUrl(
  url: string,
  data: TransferData,
  headers?: Record<string, string>
): Promise<void> {
  if (typeof data === "string")
    throw new Error("File uploads are not supported");

  await axios.put(url, data, {
    headers,
  });
}

export function metadataToHeaders(
  metadata: Metadata,
  prefix: string
): Record<string, string> {
  return Object.keys(metadata).reduce(
    (acc: Record<string, string>, suffix: string) => ({
      ...acc,
      [`${prefix}${suffix}`.toLowerCase()]: metadata[suffix],
    }),
    {}
  );
}

export function assertTransferConfig(transferConfig: TransferConfig): void {
  assertPrimitiveType(transferConfig, "transferConfig", "object");
  assertPrimitiveType(
    transferConfig.baseUrl,
    "transferConfig.baseUrl",
    "string"
  );
  assertInstanceType(
    transferConfig.expiration,
    "transferConfig.expiration",
    Date
  );
  if (new Date() > transferConfig.expiration)
    throw Error("Transfer config is expired");
}

export function assertFrontendTransferType(
  type: TransferType
): asserts type is FrontendTransferType {
  if (type === "local") {
    throw new Error(`Unsupported transfer type: ${type}`);
  }
}

export function assertFrontendTransferData(
  data: TransferData
): asserts data is FrontendTransferData {
  const dataType = typeof data;
  if (dataType === "string") {
    throw new Error(`Unsupported transfer data: ${dataType}`);
  }
}

export function assertFrontendMultipartUploadData(
  data: MultipartUploadData
): asserts data is FrontendMultipartUploadData {
  const dataType = typeof data;
  if (dataType === "string") {
    throw new Error(`Unsupported transfer data: ${dataType}`);
  }
}

export function isLocalUrlTransfer(transfer: {
  localPath?: string;
}): transfer is { localPath: string } {
  return "localPath" in transfer;
}

export const uploadFileSizeLimit = 5_000_000_000; // 5GB
