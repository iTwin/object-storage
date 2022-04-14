/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  S3FrontendStorageBindings,
  S3FrontendStorageBindingsConfig,
} from "@itwin/object-storage-s3/lib/frontend";

import { FrontendStorage } from "@itwin/object-storage-core";

import { MinioFrontendStorage } from "./MinioFrontendStorage";

export class MinioFrontendStorageBindings extends S3FrontendStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: Container,
    config: S3FrontendStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.rebind(FrontendStorage).to(MinioFrontendStorage);
  }
}
