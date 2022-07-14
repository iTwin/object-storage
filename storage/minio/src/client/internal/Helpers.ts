/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { assertFileNotEmpty, streamToBuffer, uploadToUrl } from "@itwin/object-storage-core/lib/server/internal"
import { UrlUploadInput } from "@itwin/object-storage-core";
import { metadataToHeaders } from "@itwin/object-storage-core/lib/common/internal";
import { createReadStream } from "fs";
import { Readable } from "stream";

export async function handleMinioUrlUpload(
  input: UrlUploadInput
): Promise<void> {
  // minio responds with 411 error if Content-Length header is not present
  // used streamToBuffer to get the length before uploading for streams
  const { data, metadata, url } = input;

  let dataToUpload: Buffer;
  if (data instanceof Buffer) dataToUpload = data;
  else if (data instanceof Readable) dataToUpload = await streamToBuffer(data);
  else {
    await assertFileNotEmpty(data);
    dataToUpload = await streamToBuffer(createReadStream(data));
  }
  const metaHeaders = metadata
    ? metadataToHeaders(metadata, "x-amz-meta-")
    : undefined;
  const headers = {
    ...metaHeaders,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Length": dataToUpload.byteLength.toString(),
  };
  return uploadToUrl(url, dataToUpload, headers);
}
