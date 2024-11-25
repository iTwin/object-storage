/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomBytes } from "crypto";
import { createReadStream, createWriteStream, promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import axios from "axios";

import { ConfigTransferInput, UrlTransferInput } from "../../common";
import { defaultExpiresInSeconds } from "../../common/internal";
import {
  ConfigDownloadInput,
  ExpiryOptions,
  TransferData,
  TransferType,
  UrlDownloadInput,
} from "../Interfaces";

export function assertLocalFile(
  localPath: string | undefined
): asserts localPath is string {
  if (!localPath) throw new Error("Specify localPath");
}

export async function assertFileNotEmpty(filePath: string): Promise<void> {
  const fileStats = await promises.stat(filePath);
  if (fileStats.size === 0) {
    throw new Error("Provided path is an empty file.");
  }
}

export function isLocalTransferInput(
  transfer: UrlTransferInput | ConfigTransferInput
): transfer is (UrlDownloadInput | ConfigDownloadInput) & {
  localPath: string;
} {
  if ("localPath" in transfer) {
    const localInput = transfer as UrlDownloadInput | ConfigDownloadInput;
    return localInput.localPath !== undefined;
  }
  return false;
}

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks = Array<Uint8Array>();
    stream.on("data", (data) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export function bufferToStream(buffer: Buffer): Readable {
  return Readable.from(buffer);
}

export async function streamToLocalFile(
  stream: Readable,
  destinationPath: string
): Promise<void> {
  await promises.mkdir(dirname(destinationPath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const fileStream = createWriteStream(destinationPath);

    stream.on("error", reject);
    fileStream.on("error", reject);
    fileStream.on("finish", resolve);

    stream.pipe(fileStream);
  });
}

export function bufferToTransferType(
  buffer: Buffer,
  transferType: "buffer" | "stream"
): TransferData {
  switch (transferType) {
    case "stream":
      return bufferToStream(buffer);
    case "buffer":
      return buffer;
    default:
      throw new Error(
        `Type '${
          transferType === undefined ? "undefined" : transferType
        }' is not supported`
      );
  }
}

export async function streamToTransferType(
  stream: Readable,
  transferType: TransferType,
  localPath?: string
): Promise<TransferData> {
  switch (transferType) {
    case "local":
      assertLocalFile(localPath);
      await streamToLocalFile(stream, localPath);
      return localPath;
    case "stream":
      return stream;
    case "buffer":
      return streamToBuffer(stream);
    default:
      throw new Error(
        `Type '${
          transferType === undefined ? "undefined" : transferType
        }' is not supported`
      );
  }
}

export async function downloadFromUrl(
  input: UrlDownloadInput
): Promise<TransferData> {
  const { transferType, url } = input;

  // There is an issue with Axios type definitions. Casting should be removed
  // after upgrading to Axios 1.0
  // See: https://github.com/axios/axios/pull/4229
  const signal = input.abortSignal as AbortSignal | undefined;

  switch (transferType) {
    case "buffer":
      return downloadFromUrlAsBuffer(url, signal);
    case "stream":
      return downloadFromUrlAsStream(url, signal);
    case "local":
      const localPath = input.localPath;
      assertLocalFile(localPath);
      return downloadFromUrlToLocalFile(url, localPath, signal);
    default:
      throw new Error(`Type ${input.transferType} is not supported`);
  }
}

export async function uploadToUrl(
  url: string,
  data: TransferData,
  headers?: Record<string, string>
): Promise<void> {
  let dataToUpload: Readable | Buffer;
  if (typeof data === "string") {
    await assertFileNotEmpty(data);
    dataToUpload = createReadStream(data);
  } else {
    dataToUpload = data;
  }
  await axios.put(url, dataToUpload, {
    headers,
  });
}

// TODO: switch to using crypto.randomUUID function once support for Node 12.x is dropped.
export function getRandomString(): string {
  return randomBytes(16).toString("hex");
}

async function downloadFromUrlAsBuffer(
  url: string,
  signal?: AbortSignal
): Promise<Buffer> {
  let promise = axios.get(url, {
    responseType: "arraybuffer",
    signal,
  });
  promise = convertAbortErrorName(promise);
  return (await promise).data as Buffer;
}

async function downloadFromUrlAsStream(
  url: string,
  signal?: AbortSignal
): Promise<Readable> {
  let promise = axios.get(url, {
    responseType: "stream",
    signal,
  });
  promise = convertAbortErrorName(promise);
  return (await promise).data as Readable;
}

async function downloadFromUrlToLocalFile(
  url: string,
  localPath: string,
  signal?: AbortSignal
): Promise<string> {
  let promise = axios.get(url, {
    responseType: "stream",
    signal,
  });
  promise = convertAbortErrorName(promise);

  const stream = (await promise).data as Readable;
  await streamToLocalFile(stream, localPath);

  return localPath;
}

async function convertAbortErrorName<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "CanceledError")
      error.name = "AbortError";

    throw error;
  }
}

export function getExpiryDate(options?: ExpiryOptions): Date {
  if (options?.expiresInSeconds && options?.expiresOn) {
    throw new Error(
      "Only one of 'expiresInSeconds' and 'expiresOn' can be specified."
    );
  }
  if (options?.expiresInSeconds) {
    return new Date(Date.now() + options.expiresInSeconds * 1000);
  }
  if (options?.expiresOn) {
    return options.expiresOn;
  }
  return new Date(Date.now() + defaultExpiresInSeconds * 1000); // expires in one hour by default
}
