/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  FrontendTransferData,
  FrontendTransferType,
} from "../FrontendInterfaces";

export async function streamToBufferFrontend(
  stream: ReadableStream
): Promise<ArrayBuffer> {
  return new Response(stream).arrayBuffer();
}

export async function streamToTransferTypeFrontend(
  stream: ReadableStream,
  transferType: FrontendTransferType
): Promise<FrontendTransferData> {
  switch (transferType) {
    case "buffer":
      return streamToBufferFrontend(stream);

    case "stream":
      return stream;

    default:
      throw new Error(
        `Type '${
          transferType === undefined ? "undefined" : transferType
        }' is not supported`
      );
  }
}
