/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { UrlTransferClient } from "@itwin/object-storage-core/lib/server/internal";

import { DependencyConfig, DIContainer } from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
  RetryOptions,
  Types as CoreTypes,
} from "@itwin/object-storage-core";

import { Constants, Types } from "../common";
import { S3ClientWrapperFactory } from "../server";

import { S3ClientStorage } from "./S3ClientStorage";

export interface S3ClientStorageBindingsConfig extends DependencyConfig {
  retryOptions?: RetryOptions;
}

export class S3ClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config?: S3ClientStorageBindingsConfig
  ): void {
    container.registerInstance<S3ClientStorageBindingsConfig>(
      Types.S3Client.config,
      config ?? { dependencyName: Constants.storageType }
    );
    container.registerFactory<S3ClientWrapperFactory>(
      CoreTypes.Client.clientWrapperFactory,
      (c: DIContainer) =>
        new S3ClientWrapperFactory(
          c.resolve<S3ClientStorageBindingsConfig>(
            Types.S3Client.config
          ).retryOptions
        )
    );
    container.registerFactory<UrlTransferClient>(
      UrlTransferClient,
      (c: DIContainer) =>
        new UrlTransferClient(
          c.resolve<S3ClientStorageBindingsConfig>(
            Types.S3Client.config
          ).retryOptions
        )
    );
    container.registerFactory<ClientStorage>(
      CoreTypes.Client.clientStorage,
      (c: DIContainer) =>
        new S3ClientStorage(
          c.resolve(CoreTypes.Client.clientWrapperFactory),
          c.resolve(UrlTransferClient)
        )
    );
  }
}
