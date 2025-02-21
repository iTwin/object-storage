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
  GoogleStorageConfig,
  StorageWrapper,
  StorageWrapperFactory,
} from "../server/wrappers";

import { GoogleServerStorage } from "./GoogleServerStorage";
import { StorageControlClientWrapper } from "./wrappers/StorageControlClientWrapper";

export type GoogleServerStorageBindingsConfig = GoogleStorageConfig &
  DependencyConfig;

export class GoogleServerStorageBindings extends ServerStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config: GoogleServerStorageBindingsConfig
  ): void {
    if (!config.projectId)
      throw new ConfigError<GoogleStorageConfig>("projectId");
    if (!config.bucketName)
      throw new ConfigError<GoogleStorageConfig>("bucketName");

    container.registerInstance<GoogleStorageConfig>(
      Types.GoogleServer.config,
      config
    );
    container.registerFactory(StorageWrapperFactory, () => {
      return new StorageWrapperFactory();
    });
    container.registerFactory(StorageWrapper, (c: DIContainer) => {
      const factory = c.resolve(StorageWrapperFactory);
      const config = c.resolve<GoogleStorageConfig>(Types.GoogleServer.config);
      return factory.createDefaultApplication(config);
    });
    container.registerFactory(StorageControlClientWrapper, (c: DIContainer) => {
      const config = c.resolve<GoogleStorageConfig>(Types.GoogleServer.config);
      return new StorageControlClientWrapper(config);
    });
    container.registerFactory<ServerStorage>(
      CoreTypes.Server.serverStorage,
      (c: DIContainer) => {
        const config = c.resolve<GoogleStorageConfig>(
          Types.GoogleServer.config
        );
        const storage = c.resolve<StorageWrapper>(StorageWrapper);
        const storageControl = c.resolve<StorageControlClientWrapper>(
          StorageControlClientWrapper
        );
        return new GoogleServerStorage(storage, storageControl, config);
      }
    );
  }
}
