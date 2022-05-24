/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";

import {
  UrlUploadInput,
  TransferData
} from "@itwin/object-storage-core/lib/client";
import {
  streamToBuffer,
  uploadToUrl,
  assertFileNotEmpty
} from "@itwin/object-storage-core/lib/server";
import {
  metadataToHeaders,
  assertRelativeDirectory,
  instanceOfUrlInput
} from "@itwin/object-storage-core/lib/frontend";

import {
  S3ClientStorage,
  S3ClientWrapperFactory,
  S3ConfigUploadInput,
} from "@itwin/object-storage-s3";
import { Readable } from "stream";

export async function handleMinioUrlUpload(
  input: UrlUploadInput
): Promise<void> {
  // minio responds with 411 error if Content-Length header is not present
  // used streamToBuffer to get the length before uploading for streams
  const { data, metadata, url } = input;

  const metaHeaders = metadata
    ? metadataToHeaders(metadata, "x-amz-meta-")
    : undefined;

  const headers = {
    ...metaHeaders,
  };

  if(typeof data === "string")
    throw new Error("TransferData of type string is not supported");

  const dataToUpload = data instanceof Readable ? await streamToBuffer(data) : data;

  const size = dataToUpload.byteLength;

  headers["Content-Length"] = size.toString();

  return uploadToUrl(url, dataToUpload, headers);
}


export class MinioClientStorage extends S3ClientStorage {
  constructor(clientWrapperFactory: S3ClientWrapperFactory) {
    super(clientWrapperFactory);
  }

  public override async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    await assertFileNotEmpty(input.data);

    const dataToUpload: TransferData =
      typeof input.data === "string"
        ? await streamToBuffer(createReadStream(input.data))
        : input.data;

    if (instanceOfUrlInput(input)) {
      return handleMinioUrlUpload({ ...input, data: dataToUpload });
    } else {
      return super.upload(input);
    }
  }
}
