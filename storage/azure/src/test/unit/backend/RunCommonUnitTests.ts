/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { BlobServiceClient } from "@azure/storage-blob";
import { Container } from "inversify";
import { createStubInstance } from "sinon";

import { Types } from "@itwin/object-storage-core";
import { StorageUnitTests } from "@itwin/object-storage-tests-backend-unit";

import { AzureClientStorageBindings } from "../../../client";
import {
  AzureServerStorageBindings,
  AzureServerStorageBindingsConfig,
  BlobServiceClientWrapper,
  BlockBlobClientWrapperFactory,
} from "../../../server";

const dependencyName = "azure";
const azureTestConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName,
    accountName: "testAccountName",
    accountKey: "testAccountKey",
    baseUrl: "testBaseUrl",
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

class TestAzureServerStorageBindings extends AzureServerStorageBindings {
  public override register(
    container: Container,
    config: AzureServerStorageBindingsConfig
  ): void {
    super.register(container, config);

    const mockBlobServiceClient = createStubInstance(BlobServiceClient);
    const mockBlobServiceClientWrapper = createStubInstance(
      BlobServiceClientWrapper
    );

    container.bind(BlobServiceClient).toConstantValue(mockBlobServiceClient);
    container
      .rebind(BlobServiceClientWrapper)
      .toConstantValue(mockBlobServiceClientWrapper);
  }
}

class TestAzureClientStorageBindings extends AzureClientStorageBindings {
  public override register(container: Container): void {
    super.register(container);

    const mockBlockBlobClientWrapperFactory = createStubInstance(
      BlockBlobClientWrapperFactory
    );

    container
      .rebind(Types.Client.clientWrapperFactory)
      .toConstantValue(mockBlockBlobClientWrapperFactory);
  }
}

const tests = new StorageUnitTests(
  azureTestConfig,
  TestAzureServerStorageBindings,
  TestAzureClientStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
