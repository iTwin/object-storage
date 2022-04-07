/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createWriteStream, promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import axios from "axios";

import { UrlDownloadInput } from "./ClientStorage";
import { downloadFromUrlFrontendFriendly } from "./Helpers";
import { TransferData } from "./StorageInterfaces";

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

export function assertLocalFile(
  localPath: string | undefined
): asserts localPath is string {
  if (!localPath) throw new Error("Specify localPath");
}
