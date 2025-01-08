/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { AzureClientStorageBindings } from "../../../client";
import { AzureServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const dependencyName = "azure";

const config = {
  ServerStorage: [
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
  ClientStorage: {
    dependencyName,
  },
  FrontendStorage: {
    dependencyName,
  },
};

const tests = new StorageIntegrationTests(
  config,
  AzureServerStorageBindings,
  AzureClientStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
