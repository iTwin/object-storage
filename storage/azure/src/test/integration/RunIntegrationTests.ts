/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import { AzureClientStorageBindings } from "../../AzureClientStorageBindings";
import { AzureServerStorageBindings } from "../../AzureServerStorageBindings";
import { AzureFrontendStorageBindings } from "../../AzureFrontendStorageBindings";

const dependencyName = "azure";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName,
    accountName: process.env.TEST_AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.TEST_AZURE_STORAGE_ACCOUNT_KEY,
    baseUrl: process.env.TEST_AZURE_STORAGE_BASE_URL,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName,
  }
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
