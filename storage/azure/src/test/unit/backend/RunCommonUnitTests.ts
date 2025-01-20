/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlobServiceClient } from "@azure/storage-blob";
import { createStubInstance } from "sinon";

import { DIContainer, TypedDependencyConfig } from "@itwin/cloud-agnostic-core";
import { Types } from "@itwin/object-storage-core";
import { StorageUnitTests } from "@itwin/object-storage-tests-backend-unit";

import { AzureClientStorageBindings } from "../../../client";
import { Constants } from "../../../common";
import {
  AzureServerStorageBindings,
  AzureServerStorageBindingsConfig,
  BlobServiceClientWrapper,
  BlockBlobClientWrapperFactory,
} from "../../../server";

const dependencyName = Constants.storageType;
const azureTestConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    bindingStrategy: "Dependency",
    instance: {
      dependencyName,
      accountName: "testAccountName",
      accountKey: "testAccountKey",
      baseUrl: "https://testBaseUrl.com",
    },
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
    },
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
    },
  } as TypedDependencyConfig,
};

class TestAzureServerStorageBindings extends AzureServerStorageBindings {
  public override register(
    container: DIContainer,
    config: AzureServerStorageBindingsConfig
  ): void {
    super.register(container, config);

    const mockBlobServiceClient = createStubInstance(BlobServiceClient);
    const mockBlobServiceClientWrapper = createStubInstance(
      BlobServiceClientWrapper
    );

    container.registerInstance(BlobServiceClient, mockBlobServiceClient);
    container.unregister(BlobServiceClientWrapper);
    container.registerInstance(
      BlobServiceClientWrapper,
      mockBlobServiceClientWrapper
    );
  }
}

class TestAzureClientStorageBindings extends AzureClientStorageBindings {
  public override register(container: DIContainer): void {
    super.register(container);

    const mockBlockBlobClientWrapperFactory = createStubInstance(
      BlockBlobClientWrapperFactory
    );

    container.unregister(Types.Client.clientWrapperFactory);
    container.registerInstance(
      Types.Client.clientWrapperFactory,
      mockBlockBlobClientWrapperFactory
    );
  }
}

const tests = new StorageUnitTests(
  azureTestConfig,
  TestAzureServerStorageBindings,
  TestAzureClientStorageBindings,
  dependencyName
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
