/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { Container } from "inversify";

import {
  Types as CoreTypes,
  FrontendStorage,
} from "@itwin/object-storage-core/lib/frontend";
import { S3FrontendStorageBindings } from "@itwin/object-storage-s3/lib/frontend";

import { MinioFrontendStorage } from "./MinioFrontendStorage";
import { FrontendMinioS3ClientWrapperFactory } from "./wrappers/FrontendMinioS3ClientFactory";

export class MinioFrontendStorageBindings extends S3FrontendStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(container: Container): void {
    super.register(container);

    container
      .rebind(FrontendStorage)
      .to(MinioFrontendStorage)
      .inSingletonScope();

    container
      .rebind(CoreTypes.Frontend.clientWrapperFactory)
      .to(FrontendMinioS3ClientWrapperFactory)
      .inSingletonScope();
  }
}
