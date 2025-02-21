/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlobServiceClient } from "@azure/storage-blob";

import { DIContainer } from "@itwin/cloud-agnostic-core";
import { ServerStorage, Types as CoreTypes } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  InvalidConfigTestCase,
  testBindings,
  testInvalidServerConfig,
} from "@itwin/object-storage-tests-backend-unit";

import { Constants, Types } from "../../../common";
import {
  AzureServerStorage,
  AzureServerStorageBindings,
  AzureServerStorageBindingsConfig,
  AzureServerStorageConfig,
  BlobServiceClientWrapper,
} from "../../../server";

describe(`${AzureServerStorageBindings.name}`, () => {
  const serverBindings = new AzureServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
    const invalidConfigTestCases: InvalidConfigTestCase[] = [
      {
        config: {
          dependencyName: Constants.storageType,
        } as unknown as AzureServerStorageBindingsConfig,
        expectedErrorMessage: "accountName is not defined in configuration",
      },
      {
        config: {
          dependencyName: Constants.storageType,
          accountName: "testAccountName",
        } as unknown as AzureServerStorageBindingsConfig,
        expectedErrorMessage: "accountKey is not defined in configuration",
      },
      {
        config: {
          dependencyName: Constants.storageType,
          accountName: "testAccountName",
          accountKey: "testAccountKey",
        } as unknown as AzureServerStorageBindingsConfig,
        expectedErrorMessage: "baseUrl is not defined in configuration",
      },
    ];
    testInvalidServerConfig(serverBindings, invalidConfigTestCases);

    const config: AzureServerStorageBindingsConfig = {
      dependencyName: Constants.storageType,
      accountName: "testAccountName",
      accountKey: "testAccountKey",
      baseUrl: "testBaseUrl",
    };
    const bindingsTestCases: DependencyBindingsTestCase[] = [];
    [
      {
        testedClassIdentifier: ServerStorage.name,
        testedFunction: (c: DIContainer) =>
          c.resolve<ServerStorage>(CoreTypes.Server.serverStorage),
        expectedCtor: AzureServerStorage,
      },
      {
        testedClassIdentifier: Types.AzureServer.config.toString(),
        testedFunction: (c: DIContainer) =>
          c.resolve<AzureServerStorageConfig>(Types.AzureServer.config),
        expectedCtor: Object,
      },
      {
        testedClassIdentifier: BlobServiceClientWrapper.name,
        testedFunction: (c: DIContainer) => c.resolve(BlobServiceClientWrapper),
        expectedCtor: BlobServiceClientWrapper,
      },
      {
        testedClassIdentifier: BlobServiceClient.name,
        testedFunction: (c: DIContainer) => c.resolve(BlobServiceClient),
        expectedCtor: BlobServiceClient,
      },
    ];
    testBindings(serverBindings, config, bindingsTestCases);
  });
});
