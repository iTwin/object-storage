/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Types as CoreTypes } from "@itwin/object-storage-core/lib/common";
import {
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core/lib/frontend";

import { ConfigError, DependencyConfig } from "@itwin/cloud-agnostic-core";

import { S3ClientWrapperFactory } from "./S3ClientWrapperFactory";
import { S3FrontendStorage } from "./S3FrontendStorage";
import { S3FrontendStorageConfig } from "./S3FrontendStorageConfig";

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

    container
      .bind(CoreTypes.Frontend.clientWrapperFactory)
      .to(S3ClientWrapperFactory)
      .inSingletonScope();
    container.bind(FrontendStorage).to(S3FrontendStorage);
  }
}
