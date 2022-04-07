/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import {
  assertLocalFile,
  streamToLocalFile,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { streamToTransferTypeFrontend } from "./Helpers";

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

  return streamToTransferTypeFrontend(stream, transferType, localPath);
}
