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

import { GoogleClientStorage } from "./GoogleClientStorage";
import { ClientStorageWrapperFactory } from "./wrappers";

export interface GoogleClientStorageBindingsConfig extends DependencyConfig {
  retryOptions?: RetryOptions;
}

export class GoogleClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config?: GoogleClientStorageBindingsConfig
  ): void {
    container.registerInstance<GoogleClientStorageBindingsConfig>(
      Types.GoogleClient.config,
      config ?? { dependencyName: Constants.storageType }
    );
    container.registerFactory(
      ClientStorageWrapperFactory,
      () => new ClientStorageWrapperFactory()
    );
    container.registerFactory<UrlTransferClient>(
      UrlTransferClient,
      (c: DIContainer) =>
        new UrlTransferClient(
          c.resolve<GoogleClientStorageBindingsConfig>(
            Types.GoogleClient.config
          ).retryOptions
        )
    );
    container.registerFactory<ClientStorage>(
      CoreTypes.Client.clientStorage,
      (c: DIContainer) =>
        new GoogleClientStorage(
          c.resolve(ClientStorageWrapperFactory),
          c.resolve(UrlTransferClient)
        )
    );
  }
}
