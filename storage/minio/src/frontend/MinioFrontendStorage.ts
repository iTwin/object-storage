/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { instanceOfUrlTransferInput } from "@itwin/object-storage-core/lib/common/internal";
import {
  FrontendConfigUploadInput,
  FrontendUrlUploadInput,
} from "@itwin/object-storage-core/lib/frontend";
import {
  FrontendS3ClientWrapperFactory,
  S3FrontendStorage,
} from "@itwin/object-storage-s3/lib/frontend";

import { handleMinioUrlUploadFrontend } from "./internal";

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
