/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { TypedDependencyConfig } from "@itwin/cloud-agnostic-core";
import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { AzureClientStorageBindings } from "../../../client";
import { Constants } from "../../../common";
import { AzureServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const dependencyName = Constants.storageType;

const config = {
  ServerStorage: {
    bindingStrategy: "NamedDependency",
    instances: [
      {
        dependencyName,
        instanceName: "primary",
        ...new ServerStorageConfigProvider().get(),
      },
      {
        dependencyName,
        instanceName: "secondary",
        ...new ServerStorageConfigProvider().getSecondary(),
      },
    ],
  } as TypedDependencyConfig,
  ClientStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
    },
  } as TypedDependencyConfig,
  FrontendStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
    },
  } as TypedDependencyConfig,
};

const tests = new StorageIntegrationTests(
  config,
  AzureServerStorageBindings,
  AzureClientStorageBindings,
  dependencyName
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
