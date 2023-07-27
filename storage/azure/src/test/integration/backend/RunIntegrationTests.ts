/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { AzureClientStorageBindings } from "../../../client";
import { AzureServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const dependencyName = "azure";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
