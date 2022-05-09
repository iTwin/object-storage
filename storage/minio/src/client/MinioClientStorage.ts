/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";

import {
  assertFileNotEmpty,
  FrontendTransferData,
  instanceOfUrlInput,
  streamToBuffer,
  UrlUploadInput,
} from "@itwin/object-storage-core";
import {
  S3ClientStorage,
  S3ClientWrapperFactory,
  S3ConfigUploadInput,
} from "@itwin/object-storage-s3";

import { handleMinioUrlUpload } from "../frontend";
import { assertRelativeDirectory } from "@itwin/object-storage-core";

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

    const dataToUpload: FrontendTransferData =
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
