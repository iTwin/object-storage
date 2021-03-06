/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";
import { Container } from "inversify";

import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import { DependencyConfig } from "@itwin/cloud-agnostic-core";
import {
  Types as CoreTypes,
  PresignedUrlProvider,
  ServerStorage,
  ServerStorageDependency,
  TransferConfigProvider,
} from "@itwin/object-storage-core";

import { Types } from "../common";
import { createS3Client, createStsClient } from "../common/internal";

import { S3PresignedUrlProvider } from "./S3PresignedUrlProvider";
import { S3ServerStorage, S3ServerStorageConfig } from "./S3ServerStorage";
import { S3TransferConfigProvider } from "./S3TransferConfigProvider";
import { S3ClientWrapper } from "./wrappers";

/* eslint-disable @typescript-eslint/indent */
export type S3ServerStorageBindingsConfig = S3ServerStorageConfig &
  DependencyConfig;
/* eslint-enable @typescript-eslint/indent */

export class S3ServerStorageBindings extends ServerStorageDependency {
  public readonly dependencyName: string = "s3";

  public override register(
    container: Container,
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

    container
      .bind<S3ServerStorageConfig>(Types.S3Server.config)
      .toConstantValue(config);

    container.bind(ServerStorage).to(S3ServerStorage).inSingletonScope();

    container.bind(S3Client).toConstantValue(createS3Client(config));
    container.bind(STSClient).toConstantValue(createStsClient(config));

    container.bind(Types.bucket).toConstantValue(config.bucket);

    container.bind(S3ClientWrapper).toSelf().inSingletonScope();

    container
      .bind<PresignedUrlProvider>(CoreTypes.Server.presignedUrlProvider)
      .to(S3PresignedUrlProvider)
      .inSingletonScope();
    container
      .bind<TransferConfigProvider>(CoreTypes.Server.transferConfigProvider)
      .to(S3TransferConfigProvider)
      .inSingletonScope();
  }
}
