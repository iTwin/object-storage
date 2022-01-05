/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";
import { Container } from "inversify";

import {
  ConfigError,
  ExtensionConfig,
} from "@itwin/cloud-agnostic-core";
import {
  PresignedUrlProvider,
  ServerSideStorage,
  ServerSideStorageExtension,
  Types as StorageTypes,
  TransferConfigProvider,
} from "@itwin/object-storage-core";

import { S3ClientWrapper } from "./S3ClientWrapper";
import { S3PresignedUrlProvider } from "./S3PresignedUrlProvider";
import { S3TransferConfigProvider } from "./S3TransferConfigProvider";
import { Types } from "./Types";

import {
  createS3Client,
  createStsClient,
  S3ServerSideStorage,
  S3ServerSideStorageConfig,
} from ".";

export type S3ServerSideStorageExtensionConfig = S3ServerSideStorageConfig &
  ExtensionConfig;

export class S3ServerSideStorageExtension extends ServerSideStorageExtension {
  public readonly extensionName: string = "s3";

  public override bind(
    container: Container,
    config: S3ServerSideStorageExtensionConfig
  ): void {
    if (!config.accessKey)
      throw new ConfigError<S3ServerSideStorageConfig>("accessKey");
    if (!config.bucket)
      throw new ConfigError<S3ServerSideStorageConfig>("bucket");
    if (!config.hostname)
      throw new ConfigError<S3ServerSideStorageConfig>("hostname");
    if (!config.protocol)
      throw new ConfigError<S3ServerSideStorageConfig>("protocol");
    if (!config.roleArn)
      throw new ConfigError<S3ServerSideStorageConfig>("roleArn");
    if (!config.secretKey)
      throw new ConfigError<S3ServerSideStorageConfig>("secretKey");
    if (!config.stsHostname)
      throw new ConfigError<S3ServerSideStorageConfig>("stsHostname");

    container
      .bind<S3ServerSideStorageConfig>(Types.S3ServerSide.config)
      .toConstantValue(config);

    container.bind(ServerSideStorage).to(S3ServerSideStorage);

    container.bind(S3Client).toConstantValue(createS3Client(config));
    container.bind(STSClient).toConstantValue(createStsClient(config));

    container.bind(Types.bucket).toConstantValue(config.bucket);

    container.bind(S3ClientWrapper).toSelf();

    container
      .bind<PresignedUrlProvider>(StorageTypes.ServerSide.presignedUrlProvider)
      .to(S3PresignedUrlProvider);
    container
      .bind<TransferConfigProvider>(
        StorageTypes.ServerSide.transferConfigProvider
      )
      .to(S3TransferConfigProvider);
  }
}
