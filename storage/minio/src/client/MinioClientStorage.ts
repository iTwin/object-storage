/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { instanceOfUrlTransferInput } from "@itwin/object-storage-core/lib/common/internal";

import { UrlUploadInput } from "@itwin/object-storage-core";
import {
  S3ClientStorage,
  S3ClientWrapperFactory,
  S3ConfigUploadInput,
} from "@itwin/object-storage-s3";

import { handleMinioUrlUpload } from "./internal";

export class MinioClientStorage extends S3ClientStorage {
  constructor(clientWrapperFactory: S3ClientWrapperFactory) {
    super(clientWrapperFactory);
  }

  public override async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    if (instanceOfUrlTransferInput(input)) return handleMinioUrlUpload(input);

    return super.upload(input);
  }
}
