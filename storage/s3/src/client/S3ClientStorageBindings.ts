/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ConfigError } from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
  Types as CoreTypes,
} from "@itwin/object-storage-core";

import { Types } from "../common";
import {
  S3FrontendStorageBindingsConfig,
  S3FrontendStorageConfig,
} from "../frontend";

import { S3ClientStorage } from "./S3ClientStorage";
import { S3ClientWrapperFactory } from "./S3ClientWrapperFactory";

export class S3ClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = "s3";

  public override register(
    container: Container,
    config: S3FrontendStorageBindingsConfig
  ): void {
    if (!config.bucket)
      throw new ConfigError<S3FrontendStorageBindingsConfig>("bucket");

    container
      .bind(CoreTypes.Client.clientWrapperFactory)
      .to(S3ClientWrapperFactory)
      .inSingletonScope();
    container
      .bind<S3FrontendStorageConfig>(Types.S3Client.config)
      .toConstantValue(config);
    container.bind(ClientStorage).to(S3ClientStorage);
  }
}
