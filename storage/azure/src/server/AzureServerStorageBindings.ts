/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import { DependencyConfig, DIContainer } from "@itwin/cloud-agnostic-core";
import {
  ServerStorage,
  ServerStorageDependency,
  Types as CoreTypes,
} from "@itwin/object-storage-core";

import { Constants, Types } from "../common";

import {
  AzureServerStorage,
  AzureServerStorageConfig,
  AzureServerStorageCredentialConfig,
} from "./AzureServerStorage";
import { isCredentialConfig } from "./internal";
import {
  BlobServiceClientWrapper,
  BlobServiceClientWrapperFactory,
} from "./wrappers";

export type AzureServerStorageBindingsConfig = AzureServerStorageConfig &
  DependencyConfig;

export type AzureServerStorageCredentialBindingsConfig =
  AzureServerStorageCredentialConfig & DependencyConfig;

export class AzureServerStorageBindings extends ServerStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config:
      | AzureServerStorageBindingsConfig
      | AzureServerStorageCredentialBindingsConfig
  ): void {
    if (!config.accountName)
      throw new ConfigError<AzureServerStorageConfig>("accountName");
    if (isCredentialConfig(config)) {
      if (!config.credential)
        throw new ConfigError<AzureServerStorageCredentialConfig>("credential");
    } else if (!config.accountKey)
      throw new ConfigError<AzureServerStorageConfig>("accountKey");
    if (!config.baseUrl)
      throw new ConfigError<AzureServerStorageConfig>("baseUrl");

    container.registerInstance<
      AzureServerStorageConfig | AzureServerStorageCredentialConfig
    >(Types.AzureServer.config, config);
    container.registerFactory<ServerStorage>(
      CoreTypes.Server.serverStorage,
      (c: DIContainer) => {
        return new AzureServerStorage(
          c.resolve(Types.AzureServer.config),
          c.resolve(BlobServiceClientWrapper)
        );
      }
    );

    container.registerFactory(
      BlobServiceClientWrapperFactory,
      (c: DIContainer) => {
        const resolvedConfig = c.resolve<
          AzureServerStorageConfig | AzureServerStorageCredentialConfig
        >(Types.AzureServer.config);
        return new BlobServiceClientWrapperFactory(resolvedConfig.retryOptions);
      }
    );
    container.registerFactory(BlobServiceClientWrapper, (c: DIContainer) => {
      const resolvedConfig = c.resolve<
        AzureServerStorageConfig | AzureServerStorageCredentialConfig
      >(Types.AzureServer.config);
      return c.resolve(BlobServiceClientWrapperFactory).create(resolvedConfig);
    });
  }
}
