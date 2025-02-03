/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { TypedDependencyConfig } from "@itwin/cloud-agnostic-core";
import { S3ClientStorageBindings } from "@itwin/object-storage-s3";
import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { Constants } from "../../../common";
import { OssServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const serverStorageConfig = new ServerStorageConfigProvider().get();
const config = {
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
      },
    ],
  } as TypedDependencyConfig,
  ClientStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName: Constants.storageType,
      bucket: serverStorageConfig.bucket,
    },
  } as TypedDependencyConfig,
  FrontendStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName: Constants.storageType,
      bucket: serverStorageConfig.bucket,
    },
  } as TypedDependencyConfig,
};

const tests = new StorageIntegrationTests(
  config,
  OssServerStorageBindings,
  S3ClientStorageBindings,
  Constants.storageType
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
