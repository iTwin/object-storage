/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendConfigUploadInput,
  FrontendUrlUploadInput,
  instanceOfUrlTransferInput,
  metadataToHeaders,
  streamToBufferFrontend,
  uploadToUrlFrontend,
} from "@itwin/object-storage-core/lib/frontend";
import {
  S3ClientWrapperFactoryFrontend,
  S3FrontendStorage,
} from "@itwin/object-storage-s3/lib/frontend";

export class MinioFrontendStorage extends S3FrontendStorage {
  public constructor(clientWrapperFactory: S3ClientWrapperFactoryFrontend) {
    super(clientWrapperFactory);
  }

  public override async upload(
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
  ): Promise<void> {
    if (instanceOfUrlTransferInput(input))
      return handleMinioUrlUploadFrontend(input);
    else return super.upload(input);
  }
}

export async function handleMinioUrlUploadFrontend(
  input: FrontendUrlUploadInput
): Promise<void> {
  // minio responds with 411 error if Content-Length header is not present
  // used streamToBuffer to get the length before uploading for streams
  const { data, metadata, url } = input;

  const dataToUpload =
    data instanceof ReadableStream ? await streamToBufferFrontend(data) : data;
  const metaHeaders = metadata
    ? metadataToHeaders(metadata, "x-amz-meta-")
    : undefined;
  const headers = {
    ...metaHeaders,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Length": dataToUpload.byteLength.toString(),
  };
  return uploadToUrlFrontend(url, dataToUpload, headers);
}
