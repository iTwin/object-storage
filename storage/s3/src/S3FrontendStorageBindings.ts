/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ConfigError, DependencyConfig } from "@itwin/cloud-agnostic-core";
import {
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core";

import { CommonBindings } from "./CommonBindings";
import { S3FrontendStorage } from "./S3FrontendStorage";
import { S3FrontendStorageConfig } from "./S3FrontendStorageConfig";
import { Types } from "./Types";

export type S3FrontendStorageBindingsConfig = S3FrontendStorageConfig &
  DependencyConfig;

export class S3FrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = "s3";

  public override register(
    container: Container,
    config: S3FrontendStorageBindingsConfig
  ): void {
    if (!config.bucket)
      throw new ConfigError<S3FrontendStorageBindingsConfig>("bucket");

    CommonBindings.register(container);

    container
      .bind<S3FrontendStorageConfig>(Types.S3Client.config)
      .toConstantValue(config);
    container.bind(FrontendStorage).to(S3FrontendStorage);
  }
}
