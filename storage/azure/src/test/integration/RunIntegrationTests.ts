/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import { AzureClientSideBlobStorageBindings } from "../../AzureClientSideBlobStorageBindings";
import { AzureServerSideBlobStorageBindings } from "../../AzureServerSideBlobStorageBindings";

const dependencyName = "azure";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerSideStorage: {
    dependencyName,
    accountName: process.env.TEST_AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.TEST_AZURE_STORAGE_ACCOUNT_KEY,
    baseUrl: process.env.TEST_AZURE_STORAGE_BASE_URL,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientSideStorage: {
    dependencyName,
  },
};

const tests = new StorageIntegrationTests(
  config,
  AzureServerSideBlobStorageBindings,
  AzureClientSideBlobStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
