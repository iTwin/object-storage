/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import { DependencyConfig, DIContainer } from "@itwin/cloud-agnostic-core";
import {
  ServerStorage,
  ServerStorageDependency,
} from "@itwin/object-storage-core";

import { Constants, Types } from "../common";

import {
  AzureServerStorage,
  AzureServerStorageConfig,
} from "./AzureServerStorage";
import { BlobServiceClientWrapper } from "./wrappers/BlobServiceClientWrapper";

export type AzureServerStorageBindingsConfig = AzureServerStorageConfig &
  DependencyConfig;

export class AzureServerStorageBindings extends ServerStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config: AzureServerStorageBindingsConfig
  ): void {
    if (!config.accountName)
      throw new ConfigError<AzureServerStorageConfig>("accountName");
    if (!config.accountKey)
      throw new ConfigError<AzureServerStorageConfig>("accountKey");
    if (!config.baseUrl)
      throw new ConfigError<AzureServerStorageConfig>("baseUrl");

    container.registerInstance<AzureServerStorageConfig>(
      Types.AzureServer.config,
      config
    );
    container.registerFactory(ServerStorage, (c: DIContainer) => {
      return new AzureServerStorage(
        c.resolve(Types.AzureServer.config),
        c.resolve(BlobServiceClientWrapper)
      );
    });

    container.registerFactory(BlobServiceClientWrapper, (c: DIContainer) => {
      return new BlobServiceClientWrapper(c.resolve(BlobServiceClient));
    });
    container.registerFactory(BlobServiceClient, (c: DIContainer) => {
      const resolvedConfig = c.resolve<AzureServerStorageBindingsConfig>(
        Types.AzureServer.config
      );
      return new BlobServiceClient(
        resolvedConfig.baseUrl,
        new StorageSharedKeyCredential(
          resolvedConfig.accountName,
          resolvedConfig.accountKey
        )
      );
    });
  }
}
