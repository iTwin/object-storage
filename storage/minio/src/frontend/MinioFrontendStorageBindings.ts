/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import {
  Types as CoreTypes,
  FrontendStorage,
} from "@itwin/object-storage-core/lib/frontend";
import { S3FrontendStorageBindings } from "@itwin/object-storage-s3/lib/frontend";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import { MinioFrontendStorage } from "./MinioFrontendStorage";
import { FrontendMinioS3ClientWrapperFactory } from "./wrappers/FrontendMinioS3ClientFactory";

export class MinioFrontendStorageBindings extends S3FrontendStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(container: DIContainer): void {
    super.register(container);

    container.unregister(FrontendStorage);
    container.registerFactory(
      FrontendStorage,
      (c: DIContainer) =>
        new MinioFrontendStorage(
          c.resolve<FrontendMinioS3ClientWrapperFactory>(
            CoreTypes.Frontend.clientWrapperFactory
          )
        )
    );

    container.unregister(CoreTypes.Frontend.clientWrapperFactory);
    container.registerFactory(
      CoreTypes.Frontend.clientWrapperFactory,
      () => new FrontendMinioS3ClientWrapperFactory()
    );
  }
}
