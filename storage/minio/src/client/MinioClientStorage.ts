/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import {
  metadataToHeaders,
  instanceOfTransferInput
} from "@itwin/object-storage-core/lib/common";
import {
  streamToBuffer,
  uploadToUrl,
  assertFileNotEmpty,
  UrlUploadInput
} from "@itwin/object-storage-core/lib/server";
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
    if (instanceOfTransferInput(input))
      return handleMinioUrlUpload(input);
    else
      return super.upload(input);
  }
}

export async function handleMinioUrlUpload(
  input: UrlUploadInput
): Promise<void> {
  // minio responds with 411 error if Content-Length header is not present
  // used streamToBuffer to get the length before uploading for streams
  const { data, metadata, url } = input;

  let dataToUpload: Buffer;
  if(data instanceof Buffer)
    dataToUpload = data
  else if(data instanceof Readable)
    dataToUpload = await streamToBuffer(data);
  else {
    assertFileNotEmpty(data);
    dataToUpload = await streamToBuffer( createReadStream(data) );
  }
  const metaHeaders = metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined;
  const headers = {
    ...metaHeaders,
    "Content-Length": dataToUpload.byteLength.toString()
  };
  return uploadToUrl(url, dataToUpload, headers);
}
