/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import { AzureClientStorageBindings } from "../../../client";
import { AzureFrontendStorageBindings } from "../../../frontend";
import { AzureServerStorageBindings } from "../../../server";

import { TestAzureServerStorageConfig } from "../TestAzureServerStorageConfig";

const dependencyName = "azure";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName,
    ...new TestAzureServerStorageConfig().get(),
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName,
  },
};

const tests = new StorageIntegrationTests(
  config,
  AzureServerStorageBindings,
  AzureClientStorageBindings,
  AzureFrontendStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
