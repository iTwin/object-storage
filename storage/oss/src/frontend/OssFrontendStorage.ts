/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendConfigUploadInput,
  FrontendUrlUploadInput,
  instanceOfUrlTransferInput,
  streamToBufferFrontend,
} from "@itwin/object-storage-core/lib/frontend";
import {
  FrontendS3ClientWrapperFactory,
  S3FrontendStorage,
} from "@itwin/object-storage-s3/lib/frontend";

export class OSSFrontendStorage extends S3FrontendStorage {
  public constructor(clientWrapperFactory: FrontendS3ClientWrapperFactory) {
    super(clientWrapperFactory);
  }

  public override async upload(
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
  ): Promise<void> {
    if (
      instanceOfUrlTransferInput(input) &&
      input.data instanceof ReadableStream
    ) {
      // Oss doesn't seem to support stream URL uploads
      // Might be related to S3 PutObject stream handling
      const compatibleInput = input;
      compatibleInput.data = await streamToBufferFrontend(input.data);
      return super.upload(compatibleInput);
    }
    return super.upload(input);
  }
}
