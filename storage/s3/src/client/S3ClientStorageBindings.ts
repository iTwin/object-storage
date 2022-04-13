/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ConfigError } from "@itwin/cloud-agnostic-core";

import { S3FrontendStorageConfig, S3FrontendStorageBindingsConfig, CommonBindings } from "../frontend";
import { S3ClientStorage } from "./S3ClientStorage";
import { Types } from "../Types";
import { ClientStorage, ClientStorageDependency } from "@itwin/object-storage-core";

export class S3ClientStorageBindings extends ClientStorageDependency {
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
    container.bind(ClientStorage).to(S3ClientStorage);
  }
}