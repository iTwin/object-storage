/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { TypedDependencyConfig } from "@itwin/cloud-agnostic-core";
import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { GoogleClientStorageBindings } from "../../../client/GoogleClientStorageBindings";
import { Constants, GoogleServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const serverStorageConfig = new ServerStorageConfigProvider().get();
const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    bindingStrategy: "NamedDependency",
    instances: [
      {
        dependencyName: Constants.storageType,
        instanceName: "primary",
        ...serverStorageConfig,
      },
      {
        dependencyName: Constants.storageType,
        instanceName: "secondary",
        ...serverStorageConfig,
        bucket: serverStorageConfig.secondaryBucketName,
      },
    ],
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName: Constants.storageType,
      bucket: serverStorageConfig.bucketName,
    },
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName: Constants.storageType,
      bucket: serverStorageConfig.bucketName,
    },
  } as TypedDependencyConfig,
};

/**
 * There is no way to specify expiration time for the tokens
 * without writing our own authentication implementation.
 *
 * There's also no way to specify an abort signal for storage
 * client methods.
 *
 * Object metadata is managed through separate requests from
 * upload and does not work with upload using signed URLs.
 */
const mochaGrepPattern =
  "(?!.*should use (expiresInSeconds|expiresOn) if set|.*should cancel file download to path using transfer config|.*should upload a file with metadata .* to URL)^.*$";

const tests = new StorageIntegrationTests(
  config,
  GoogleServerStorageBindings,
  GoogleClientStorageBindings,
  Constants.storageType,
  mochaGrepPattern
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
