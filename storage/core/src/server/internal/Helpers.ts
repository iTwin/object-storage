/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomBytes } from "crypto";
import { createWriteStream, promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

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
    stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      stream.destroy();
      resolve(buffer);
    });
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

// TODO: switch to using crypto.randomUUID function once support for Node 12.x is dropped.
export function getRandomString(): string {
  return randomBytes(16).toString("hex");
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
