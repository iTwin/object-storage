/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ConfigError, DependencyConfig } from "@itwin/cloud-agnostic-core";
import {
  ClientSideStorage,
  ClientSideStorageDependency,
} from "@itwin/object-storage-core";

import { S3ClientSideStorage, S3ClientSideStorageConfig, Types } from ".";

export type S3ClientSideStorageBindingsConfig = S3ClientSideStorageConfig &
  DependencyConfig;

export class S3ClientSideStorageBindings extends ClientSideStorageDependency {
  public readonly dependencyName: string = "s3";

  public override register(
    container: Container,
    config: S3ClientSideStorageBindingsConfig
  ): void {
    if (!config.bucket)
      throw new ConfigError<S3ClientSideStorageBindingsConfig>("bucket");

    container
      .bind<S3ClientSideStorageConfig>(Types.S3ClientSide.config)
      .toConstantValue(config);
    container.bind(ClientSideStorage).to(S3ClientSideStorage);
  }
}
