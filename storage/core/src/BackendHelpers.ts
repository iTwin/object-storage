/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createWriteStream, promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import axios from "axios";

import { UrlDownloadInput } from "./ClientStorage";
import {
  downloadFromUrlFrontendFriendly,
  streamToTransferTypeFrontend,
} from "./Helpers";
import { TransferData, TransferType } from "./StorageInterfaces";

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
  const { transferType, url, localPath } = input;

  if (transferType === "local") {
    assertLocalFile(localPath);

    const localResponse = await axios.get(url, {
      responseType: "stream",
    });

    await streamToLocalFile(localResponse.data, localPath);

    return localPath;
  }

  return downloadFromUrlFrontendFriendly(input);
}

export async function streamToTransferType(
  stream: Readable,
  transferType: TransferType,
  localPath?: string
): Promise<TransferData> {
  if (transferType === "local") {
    assertLocalFile(localPath);
    await streamToLocalFile(stream, localPath);
    return localPath;
  }

  return streamToTransferTypeFrontend(stream, transferType);
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
