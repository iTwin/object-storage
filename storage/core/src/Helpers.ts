/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { createReadStream, createWriteStream, promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import axios from "axios";

import {
  assertInstanceType,
  assertPrimitiveType,
} from "@itwin/cloud-agnostic-core";

import { UrlDownloadInput } from "./ClientSideStorage";
import {
  Metadata,
  ObjectDirectory,
  ObjectReference,
  TransferConfig,
  TransferData,
} from "./StorageInterfaces";

export async function streamToLocalFile(
  stream: Readable,
  destinationPath: string
): Promise<void> {
  await promises.mkdir(dirname(destinationPath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const fileStream = createWriteStream(destinationPath);
    stream.pipe(fileStream);
    stream.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

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

export async function downloadFromUrl(
  input: UrlDownloadInput
): Promise<TransferData> {
  const { transferType, localPath, url } = input;

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

    case "local":
      if (!localPath) throw new Error("Specify localPath");

      const localResponse = await axios.get(url, {
        responseType: "stream",
      });

      await streamToLocalFile(localResponse.data, localPath);

      return localPath;

    default:
      throw new Error(`Type '${transferType}' is not supported`);
  }
}

export async function uploadToUrl(
  url: string,
  data: TransferData,
  headers?: Record<string, string>
): Promise<void> {
  await axios.put(
    url,
    typeof data === "string" ? createReadStream(data) : data,
    {
      headers,
    }
  );
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

export const uploadFileSizeLimit = 5_000_000_000; // 5GB
