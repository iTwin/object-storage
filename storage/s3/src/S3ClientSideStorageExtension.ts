/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ConfigError, ExtensionConfig } from "@itwin/cloud-agnostic-core";
import {
  ClientSideStorage,
  ClientSideStorageExtension,
} from "@itwin/object-storage-core";

import { S3ClientSideStorage, S3ClientSideStorageConfig, Types } from ".";

export type S3ClientSideStorageExtensionConfig = S3ClientSideStorageConfig &
  ExtensionConfig;

export class S3ClientSideStorageExtension extends ClientSideStorageExtension {
  public readonly extensionName: string = "s3";

  public override bind(
    container: Container,
    config: S3ClientSideStorageExtensionConfig
  ): void {
    if (!config.bucket)
      throw new ConfigError<S3ClientSideStorageExtensionConfig>("bucket");

    container
      .bind<S3ClientSideStorageConfig>(Types.S3ClientSide.config)
      .toConstantValue(config);
    container.bind(ClientSideStorage).to(S3ClientSideStorage);
  }
}
