/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendConfigUploadInput,
  FrontendUrlUploadInput,
  instanceOfUrlTransferInput,
  metadataToHeaders,
  uploadToUrlFrontend,
} from "@itwin/object-storage-core/lib/frontend";
import {
  FrontendS3ClientWrapperFactory,
  S3FrontendStorage,
} from "@itwin/object-storage-s3/lib/frontend";

export class MinioFrontendStorage extends S3FrontendStorage {
  public constructor(clientWrapperFactory: FrontendS3ClientWrapperFactory) {
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
  const { data, metadata, url } = input;
  const headers = metadata
    ? metadataToHeaders(metadata, "x-amz-meta-")
    : undefined;
  return uploadToUrlFrontend(url, data, headers);
}
