/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import axios from "axios";

import {
  FrontendTransferData,
  FrontendTransferType,
  FrontendUrlDownloadInput,
} from "./FrontendInterfaces";

export const uploadFileSizeLimit = 5_000_000_000; // 5GB

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
      throw new Error(`Type '${transferType}' is not supported`);
  }
}

export async function downloadFromUrlFrontend(
  input: FrontendUrlDownloadInput
): Promise<FrontendTransferData> {
  const { transferType, url } = input;
  switch (transferType) {
    case "buffer":
      const bufferResponse = await axios.get(url, {
        responseType: "arraybuffer",
      });
      return bufferResponse.data as ArrayBuffer;

    case "stream":
      const streamResponse = await axios.get(url, {
        responseType: "stream",
      });
      return streamResponse.data as ReadableStream;

    default:
      throw new Error(`Type '${transferType}' is not supported`);
  }
}
export async function uploadToUrlFrontend(
  url: string,
  data: FrontendTransferData,
  headers?: Record<string, string>
): Promise<void> {
  await axios.put(url, data, {
    headers,
  });
}
