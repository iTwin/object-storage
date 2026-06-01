/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { DependencyConfig, DIContainer } from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
  RetryOptions,
  Types as CoreTypes,
} from "@itwin/object-storage-core";

import { Constants, Types } from "../common";
import { BlockBlobClientWrapperFactory } from "../server/wrappers/BlockBlobClientWrapperFactory";

import { AzureClientStorage } from "./AzureClientStorage";

export interface AzureClientStorageBindingsConfig extends DependencyConfig {
  retryOptions?: RetryOptions;
}

export class AzureClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config?: AzureClientStorageBindingsConfig
  ): void {
    container.registerInstance<AzureClientStorageBindingsConfig>(
      Types.AzureClient.config,
      config ?? { dependencyName: Constants.storageType }
    );
    container.registerFactory(
      CoreTypes.Client.clientWrapperFactory,
      (c: DIContainer) =>
        new BlockBlobClientWrapperFactory(
          c.resolve<AzureClientStorageBindingsConfig>(
            Types.AzureClient.config
          ).retryOptions
        )
    );
    container.registerFactory<ClientStorage>(
      CoreTypes.Client.clientStorage,
      (c: DIContainer) =>
        new AzureClientStorage(c.resolve(CoreTypes.Client.clientWrapperFactory))
    );
  }
}
