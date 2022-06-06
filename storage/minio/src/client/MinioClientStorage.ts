/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import {
  assertFileNotEmpty,
  instanceOfUrlTransferInput,
  metadataToHeaders,
  streamToBuffer,
  uploadToUrl,
  UrlUploadInput,
} from "@itwin/object-storage-core";
import {
  S3ClientStorage,
  S3ClientWrapperFactory,
  S3ConfigUploadInput,
} from "@itwin/object-storage-s3";

export class MinioClientStorage extends S3ClientStorage {
  constructor(clientWrapperFactory: S3ClientWrapperFactory) {
    super(clientWrapperFactory);
  }

  public override async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    if (instanceOfUrlTransferInput(input)) return handleMinioUrlUpload(input);
    else return super.upload(input);
  }
}

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
