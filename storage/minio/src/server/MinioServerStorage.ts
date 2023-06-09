/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ObjectReference,
  PresignedUrlProvider,
  TransferConfigProvider,
} from "@itwin/object-storage-core";
import { S3ClientWrapper, S3ServerStorage } from "@itwin/object-storage-s3";

export class MinioServerStorage extends S3ServerStorage {
  public constructor(
    s3Client: S3ClientWrapper,
    presignedUrlProvider: PresignedUrlProvider,
    transferConfigProvider: TransferConfigProvider
  ) {
    super(s3Client, presignedUrlProvider, transferConfigProvider);
  }

  public override async deleteObject(
    reference: ObjectReference
  ): Promise<void> {
    await super.deleteObject(reference);

    if (!(await this.baseDirectoryExists(reference)))
      await this.createBaseDirectory(reference);
  }
}
