/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlobServiceClient } from "@azure/storage-blob";
import { Container } from "inversify";

import { ServerStorage } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  InvalidConfigTestCase,
  testBindings,
  testInvalidServerConfig,
} from "@itwin/object-storage-tests-backend-unit";

import { Types } from "../../../common";
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
          dependencyName: "azure",
        } as unknown as AzureServerStorageBindingsConfig,
        expectedErrorMessage: "accountName is not defined in configuration",
      },
      {
        config: {
          dependencyName: "azure",
          accountName: "testAccountName",
        } as unknown as AzureServerStorageBindingsConfig,
        expectedErrorMessage: "accountKey is not defined in configuration",
      },
      {
        config: {
          dependencyName: "azure",
          accountName: "testAccountName",
          accountKey: "testAccountKey",
        } as unknown as AzureServerStorageBindingsConfig,
        expectedErrorMessage: "baseUrl is not defined in configuration",
      },
    ];
    testInvalidServerConfig(serverBindings, invalidConfigTestCases);

    const config: AzureServerStorageBindingsConfig = {
      dependencyName: "azure",
      accountName: "testAccountName",
      accountKey: "testAccountKey",
      baseUrl: "testBaseUrl",
    };
    const bindingsTestCases: DependencyBindingsTestCase[] = [];
    [
      {
        testedClassIdentifier: ServerStorage.name,
        testedFunction: (container: Container) => container.get(ServerStorage),
        expectedCtor: AzureServerStorage,
      },
      {
        testedClassIdentifier: Types.AzureServer.config.toString(),
        testedFunction: (container: Container) =>
          container.get<AzureServerStorageConfig>(Types.AzureServer.config),
        expectedCtor: Object,
      },
      {
        testedClassIdentifier: BlobServiceClientWrapper.name,
        testedFunction: (container: Container) =>
          container.get(BlobServiceClientWrapper),
        expectedCtor: BlobServiceClientWrapper,
      },
      {
        testedClassIdentifier: BlobServiceClient.name,
        testedFunction: (container: Container) =>
          container.get(BlobServiceClient),
        expectedCtor: BlobServiceClient,
      },
    ];
    testBindings(serverBindings, config, bindingsTestCases);
  });
});
