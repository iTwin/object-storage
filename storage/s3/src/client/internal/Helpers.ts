/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import { metadataToHeaders } from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  streamToBuffer,
  uploadToUrl,
} from "@itwin/object-storage-core/lib/server/internal";

import { UrlUploadInput } from "@itwin/object-storage-core";

export async function handleS3UrlUpload(input: UrlUploadInput): Promise<void> {
  const { data, metadata, url } = input;

  let dataToUpload: Buffer;
  if (data instanceof Buffer) dataToUpload = data;
  else if (data instanceof Readable) dataToUpload = await streamToBuffer(data);
  else {
    await assertFileNotEmpty(data);
    dataToUpload = await streamToBuffer(createReadStream(data));
  }
  const metadataHeaders = metadata
    ? metadataToHeaders(metadata, "x-amz-meta-")
    : {};
  const headers = {
    ...metadataHeaders,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Length": dataToUpload.byteLength.toString(),
  };
  return uploadToUrl(url, dataToUpload, headers);
}
