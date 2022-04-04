import { Container } from "inversify";

import { ConfigError, DependencyConfig } from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
} from "@itwin/object-storage-core";

import { S3ClientStorageConfig, S3FrontendStorage } from "./S3ClientStorage";
import { Types } from "./Types";

export type S3ClientStorageBindingsConfig = S3ClientStorageConfig &
  DependencyConfig;

export class S3FrontendStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = "s3";

  public override register(
    container: Container,
    config: S3ClientStorageBindingsConfig
  ): void {
    if (!config.bucket)
      throw new ConfigError<S3ClientStorageBindingsConfig>("bucket");

    container
      .bind<S3ClientStorageConfig>(Types.S3Client.config)
      .toConstantValue(config);
    container.bind(ClientStorage).to(S3FrontendStorage);
  }
}
