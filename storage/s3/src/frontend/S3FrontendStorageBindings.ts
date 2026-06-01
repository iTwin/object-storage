/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  Types as CoreTypes,
  FrontendStorage,
  FrontendStorageBindingsConfig,
  FrontendStorageDependency,
} from "@itwin/object-storage-core/lib/frontend";
import { FrontendUrlTransferClient } from "@itwin/object-storage-core/lib/frontend/internal";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import { Constants, Types } from "../common";

import { S3FrontendStorage } from "./S3FrontendStorage";
import { FrontendS3ClientWrapperFactory } from "./wrappers";

export class S3FrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config?: FrontendStorageBindingsConfig
  ): void {
    container.registerInstance<FrontendStorageBindingsConfig>(
      Types.S3Frontend.config,
      config ?? { dependencyName: Constants.storageType }
    );
    container.registerFactory<FrontendUrlTransferClient>(
      CoreTypes.Frontend.urlTransferClient,
      (c: DIContainer) =>
        new FrontendUrlTransferClient(
          c.resolve<FrontendStorageBindingsConfig>(
            Types.S3Frontend.config
          ).retryOptions
        )
    );
    container.registerFactory(
      CoreTypes.Frontend.clientWrapperFactory,
      (c: DIContainer) =>
        new FrontendS3ClientWrapperFactory(
          c.resolve<FrontendStorageBindingsConfig>(
            Types.S3Frontend.config
          ).retryOptions
        )
    );
    container.registerFactory<FrontendStorage>(
      CoreTypes.Frontend.frontendStorage,
      (c: DIContainer) =>
        new S3FrontendStorage(
          c.resolve(CoreTypes.Frontend.clientWrapperFactory),
          c.resolve(CoreTypes.Frontend.urlTransferClient)
        )
    );
  }
}
