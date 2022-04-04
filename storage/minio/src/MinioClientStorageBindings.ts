/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ClientStorage, ServerStorage } from "@itwin/object-storage-core";
import {
  S3ClientStorageBindings,
  S3ClientStorageBindingsConfig,
} from "@itwin/object-storage-s3";

import { MinioClientStorage } from "./MinioClientStorage.backend";
import { MinioServerStorage } from "./MinioServerStorage";

export class MinioClientStorageBindings extends S3ClientStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: Container,
    config: S3ClientStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.rebind(ClientStorage).to(MinioClientStorage);
    container.rebind(ServerStorage).to(MinioServerStorage);
  }
}
