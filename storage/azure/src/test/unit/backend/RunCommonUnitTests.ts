/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { createStubInstance } from "sinon";

import { StorageUnitTests } from "@itwin/object-storage-tests-backend-unit";

import { AzureClientStorage } from "../../../client";
import { BlockBlobClientWrapperFactory } from "../../../frontend";
import {
  AzureServerStorage,
  AzureServerStorageConfig,
  BlobServiceClientWrapper,
} from "../../../server";

const mockBlobServiceClientWrapper = createStubInstance(
  BlobServiceClientWrapper
);
const mockAzureServerStorageConfig: AzureServerStorageConfig = {
  accountName: "testAccountName",
  accountKey: "testAccountKey",
  baseUrl: "testBaseUrl",
};
const serverStorage = new AzureServerStorage(
  mockAzureServerStorageConfig,
  mockBlobServiceClientWrapper
);

const mockBlockBlobClientWrapperFactory = createStubInstance(
  BlockBlobClientWrapperFactory
);
const clientStorage = new AzureClientStorage(mockBlockBlobClientWrapperFactory);

const tests = new StorageUnitTests(serverStorage, clientStorage);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
