/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  ClientStorage,
  ClientStorageDependency,
} from "@itwin/object-storage-core/lib/frontend";

import { ConfigError } from "@itwin/cloud-agnostic-core";

import {
  S3ClientStorage,
  S3ClientStorageBindingsConfig,
  S3ClientStorageConfig,
  Types,
} from ".";

export class S3ClientStorageBindings extends ClientStorageDependency {
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
    container.bind(ClientStorage).to(S3ClientStorage);
  }
}
