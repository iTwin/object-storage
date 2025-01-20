/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";

import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import { DependencyConfig, DIContainer } from "@itwin/cloud-agnostic-core";
import {
  Types as CoreTypes,
  PresignedUrlProvider,
  ServerStorage,
  ServerStorageDependency,
  TransferConfigProvider,
} from "@itwin/object-storage-core";

import { Constants, Types } from "../common";
import { createS3Client, createStsClient } from "../common/internal";

import { S3PresignedUrlProvider } from "./S3PresignedUrlProvider";
import { S3ServerStorage, S3ServerStorageConfig } from "./S3ServerStorage";
import { S3TransferConfigProvider } from "./S3TransferConfigProvider";
import { S3ClientWrapper, StsWrapper } from "./wrappers";

/* eslint-disable @typescript-eslint/indent */
export type S3ServerStorageBindingsConfig = S3ServerStorageConfig &
  DependencyConfig;
/* eslint-enable @typescript-eslint/indent */

export class S3ServerStorageBindings extends ServerStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config: S3ServerStorageBindingsConfig
  ): void {
    if (!config.accessKey)
      throw new ConfigError<S3ServerStorageConfig>("accessKey");
    if (!config.bucket) throw new ConfigError<S3ServerStorageConfig>("bucket");
    if (!config.baseUrl)
      throw new ConfigError<S3ServerStorageConfig>("baseUrl");
    if (!config.region) throw new ConfigError<S3ServerStorageConfig>("region");
    if (!config.roleArn)
      throw new ConfigError<S3ServerStorageConfig>("roleArn");
    if (!config.secretKey)
      throw new ConfigError<S3ServerStorageConfig>("secretKey");
    if (!config.stsBaseUrl)
      throw new ConfigError<S3ServerStorageConfig>("stsBaseUrl");

    container.registerInstance<S3ServerStorageConfig>(
      Types.S3Server.config,
      config
    );

    container.registerFactory(
      ServerStorage,
      (c: DIContainer) =>
        new S3ServerStorage(
          c.resolve(S3ClientWrapper),
          c.resolve(CoreTypes.Server.presignedUrlProvider),
          c.resolve(CoreTypes.Server.transferConfigProvider)
        )
    );

    container.registerInstance(S3Client, createS3Client(config));
    container.registerInstance(STSClient, createStsClient(config));

    container.registerInstance(Types.bucket, config.bucket);

    container.registerFactory(StsWrapper, (c: DIContainer) => {
      return new StsWrapper(c.resolve(STSClient));
    });
    container.registerFactory(S3ClientWrapper, (c: DIContainer) => {
      return new S3ClientWrapper(c.resolve(S3Client), c.resolve(Types.bucket));
    });

    container.registerFactory<PresignedUrlProvider>(
      CoreTypes.Server.presignedUrlProvider,
      (c: DIContainer) =>
        new S3PresignedUrlProvider(
          c.resolve(S3Client),
          c.resolve(Types.S3Server.config)
        )
    );
    container.registerFactory<TransferConfigProvider>(
      CoreTypes.Server.transferConfigProvider,
      (c: DIContainer) =>
        new S3TransferConfigProvider(
          c.resolve(StsWrapper),
          c.resolve(Types.S3Server.config)
        )
    );
  }
}
