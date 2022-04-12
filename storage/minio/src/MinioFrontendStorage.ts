/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import {
  assertFrontendTransferData,
  FrontendConfigUploadInput,
  FrontendUrlUploadInput,
  instanceOfUrlUploadInput,
  metadataToHeaders,
  streamToBuffer,
  uploadToUrl,
} from "@itwin/object-storage-core/lib/frontend";
import {
  S3ClientWrapperFactory,

  S3FrontendStorage,
} from "@itwin/object-storage-s3/lib/frontend";

export async function handleMinioUrlUpload(
  input: FrontendUrlUploadInput
): Promise<void> {
  if (typeof input.data === "string") // TODO
    throw new Error("File uploads are not supported");
  // minio responds with 411 error if Content-Length header is not present
  // used streamToBuffer to get the length before uploading for streams
  const { data, metadata, url } = input;

  const metaHeaders = metadata
    ? metadataToHeaders(metadata, "x-amz-meta-")
    : undefined;

  const headers = {
    ...metaHeaders,
  };

  const dataToUpload =
    data instanceof Readable ? await streamToBuffer(data) : data;

  const size = dataToUpload.byteLength;

  headers["Content-Length"] = size.toString();

  return uploadToUrl(url, dataToUpload, headers);
}

export class MinioFrontendStorage extends S3FrontendStorage {
  public constructor(clientWrapperFactory: S3ClientWrapperFactory) {
    super(clientWrapperFactory);
  }

  public override async upload(
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
  ): Promise<void> {
    if (instanceOfUrlUploadInput(input)) {
      assertFrontendTransferData(input.data);
      return handleMinioUrlUpload(input);
    } else {
      return super.upload(input);
    }
  }
}
