/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { ExpiryOptions, ObjectDirectory } from "@itwin/object-storage-core";
import {
  S3ServerStorageConfig,
  S3TransferConfig,
  S3TransferConfigProvider,
  StsWrapper,
} from "@itwin/object-storage-s3";

import { Constants } from "../common";

export class MinioTransferConfigProvider extends S3TransferConfigProvider {
  public constructor(client: StsWrapper, config: S3ServerStorageConfig) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(client, config);
  }

  public override async getDownloadConfig(
    directory: ObjectDirectory,
    options?: ExpiryOptions
  ): Promise<S3TransferConfig> {
    const config = await super.getDownloadConfig(directory, options);
    config.storageType = Constants.storageType;
    return config;
  }

  public override async getUploadConfig(
    directory: ObjectDirectory,
    options?: ExpiryOptions
  ): Promise<S3TransferConfig> {
    const config = await super.getUploadConfig(directory, options);
    config.storageType = Constants.storageType;
    return config;
  }

  public override async getDirectoryAccessConfig(
    directory: ObjectDirectory,
    options?: ExpiryOptions
  ): Promise<S3TransferConfig> {
    const config = await super.getDirectoryAccessConfig(directory, options);
    config.storageType = Constants.storageType;
    return config;
  }
}
