/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import { AzureClientSideBlobStorageExtension } from "../../AzureClientSideBlobStorageExtension";
import { AzureServerSideBlobStorageExtension } from "../../AzureServerSideBlobStorageExtension";

const extensionName = "azure";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerSideStorage: {
    extensionName,
    accountName: process.env.TEST_AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.TEST_AZURE_STORAGE_ACCOUNT_KEY,
    baseUrl: process.env.TEST_AZURE_STORAGE_BASE_URL,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientSideStorage: {
    extensionName,
  },
};

const tests = new StorageIntegrationTests(
  config,
  AzureServerSideBlobStorageExtension,
  AzureClientSideBlobStorageExtension
);
tests
  .start()
  .catch((err) => {
    process.exitCode = 1;
    throw err;
  })
  .finally(() => tests.releaseResources());
