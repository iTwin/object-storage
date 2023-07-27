/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { BlobServiceClient } from "@azure/storage-blob";
import { Container } from "inversify";
import { createStubInstance } from "sinon";

import { StorageUnitTests } from "@itwin/object-storage-tests-backend-unit";

import { AzureClientStorageBindings } from "../../../client";
import { Types } from "../../../common";
import {
  AzureServerStorageBindings,
  AzureServerStorageBindingsConfig,
  BlobClientWrapperFactory,
  BlobServiceClientWrapper,
  BlockBlobClientWrapperFactory,
  ContainerClientWrapperFactory,
} from "../../../server";

const dependencyName = "azure";
const azureTestConfig = {
  ServerStorage: {
    dependencyName,
    accountName: "testAccountName",
    accountKey: "testAccountKey",
    baseUrl: "testBaseUrl",
  },
  ClientStorage: {
    dependencyName,
  },
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
    const mockBlobClientWrapperFactory = createStubInstance(
      BlobClientWrapperFactory
    );
    const mockContainerClientWrapperFactory = createStubInstance(
      ContainerClientWrapperFactory
    );

    container
      .rebind(Types.Client.blockBlobClientWrapperFactory)
      .toConstantValue(mockBlockBlobClientWrapperFactory);
    container
      .rebind(Types.Client.blobClientWrapperFactory)
      .toConstantValue(mockBlobClientWrapperFactory);
    container
      .rebind(Types.Client.containerClientWrapperFactory)
      .toConstantValue(mockContainerClientWrapperFactory);
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
