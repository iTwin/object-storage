/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  S3ClientStorageBindingsConfig,
  S3FrontendStorageBindings,
} from "@itwin/object-storage-s3/lib/frontend";

import { ClientStorage } from "@itwin/object-storage-core";

import { MinioFrontendStorage } from "./MinioFrontendStorage";

export class MinioFrontendStorageBindings extends S3FrontendStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: Container,
    config: S3ClientStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.rebind(ClientStorage).to(MinioFrontendStorage);
  }
}
