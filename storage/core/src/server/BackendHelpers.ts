/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createWriteStream, promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import axios from "axios";

import { TransferData, TransferType, UrlDownloadInput } from "../client";
import {
  downloadFromUrlFrontend,
  FrontendUrlDownloadInput,
} from "../frontend";

function isFrontendDownloadInput(
  input: UrlDownloadInput
): input is FrontendUrlDownloadInput {
  return input.transferType !== "local";
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

export async function downloadFromUrl(
  input: UrlDownloadInput
): Promise<TransferData> {
  if (isFrontendDownloadInput(input))
    return (await downloadFromUrlFrontend(input)) as TransferData;

  const { url, localPath } = input;
  assertLocalFile(localPath);

  const localResponse = await axios.get(url, {
    responseType: "stream",
  });
  await streamToLocalFile(localResponse.data, localPath);

  return localPath;
}

export async function uploadToUrl(
  url: string,
  data: TransferData,
  headers?: Record<string, string>
): Promise<void> {
  await axios.put(url, data, {
    headers,
  });
}

export async function streamToTransferType(
  stream: Readable,
  transferType: TransferType,
  localPath?: string
): Promise<TransferData> {
  switch(transferType) {
    case "local":
      assertLocalFile(localPath);
      await streamToLocalFile(stream, localPath);
      return localPath;
    case "stream":
      return stream;
    case "buffer":
      return streamToBuffer(stream);
    default:
      throw new Error(`Type '${transferType}' is not supported`);
  }
}

export function assertLocalFile(
  localPath: string | undefined
): asserts localPath is string {
  if (!localPath) throw new Error("Specify localPath");
}

export async function assertFileNotEmpty(data: TransferData): Promise<void> {
  if (typeof data === "string") {
    const fileStats = await promises.stat(data);
    if (fileStats.size === 0) {
      throw new Error("Provided path is an empty file.");
    }
  }
}
