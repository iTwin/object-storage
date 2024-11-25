/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import axios from "axios";

import {
  FrontendTransferData,
  FrontendTransferType,
  FrontendUrlDownloadInput,
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

export async function downloadFromUrlFrontend(
  input: FrontendUrlDownloadInput,
  headers?: Record<string, string>
): Promise<FrontendTransferData> {
  const { transferType, url } = input;
  switch (transferType) {
    case "buffer":
      const bufferResponse = await axios.get(url, {
        responseType: "arraybuffer",
        headers,
      });
      return bufferResponse.data as ArrayBuffer;

    case "stream":
      // https://github.com/axios/axios/issues/479
      const blobResponse = await axios.get(url, {
        responseType: "blob",
        headers,
      });
      return (blobResponse.data as Blob).stream();
    default:
      throw new Error(
        `Type '${
          transferType === undefined ? "undefined" : transferType
        }' is not supported`
      );
  }
}

export async function uploadToUrlFrontend(
  url: string,
  data: FrontendTransferData,
  method: "POST" | "PUT",
  headers?: Record<string, string>
): Promise<void> {
  await axios.request({
    url,
    method,
    data,
    headers,
  });
}
