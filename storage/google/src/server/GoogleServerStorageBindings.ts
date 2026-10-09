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

// https://cloud.google.com/storage/docs/buckets#naming
const bucketNamePattern = /^[a-z0-9][a-z0-9._-]*[a-z0-9]$/;
const ipAddressPattern = /^\d{1,3}(\.\d{1,3}){3}$/;

function isValidBucketName(bucketName: string): boolean {
  const maxLength = bucketName.includes(".") ? 222 : 63;
  return (
    bucketName.length >= 3 &&
    bucketName.length <= maxLength &&
    bucketNamePattern.test(bucketName) &&
    bucketName
      .split(".")
      .every((label) => label.length >= 1 && label.length <= 63) &&
    !ipAddressPattern.test(bucketName) &&
    !bucketName.startsWith("goog") &&
    !bucketName.includes("google")
  );
}

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
    if (!isValidBucketName(config.bucketName))
      throw new Error(
        "bucketName is not a valid Google Cloud Storage bucket name"
      );

    container.registerInstance<GoogleStorageConfig>(
      Types.GoogleServer.config,
      config
    );
    container.registerFactory(
      StorageWrapperFactory,
      (c: DIContainer) =>
        new StorageWrapperFactory(
          c.resolve<GoogleServerStorageBindingsConfig>(
            Types.GoogleServer.config
          ).retryOptions
        )
    );
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
