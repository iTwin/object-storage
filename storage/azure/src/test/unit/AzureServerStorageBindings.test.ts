/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlobServiceClient } from "@azure/storage-blob";
import { expect } from "chai";
import { Container } from "inversify";

import { ServerStorage } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-unit";

import { Types } from "../../common";
import {
  AzureServerStorage,
  AzureServerStorageBindings,
  AzureServerStorageBindingsConfig,
  AzureServerStorageConfig,
  BlobServiceClientWrapper,
} from "../../server";

describe(`${AzureServerStorageBindings.name}`, () => {
  const serverBindings = new AzureServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
    const config: AzureServerStorageBindingsConfig = {
      dependencyName: "azure",
      accountName: "testAccountName",
      accountKey: "testAccountKey",
      baseUrl: "testBaseUrl",
    };

    [
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
    ].forEach(
      (testCase: {
        config: AzureServerStorageBindingsConfig;
        expectedErrorMessage: string;
      }) => {
        it(`should throw if transfer config is invalid (${testCase.expectedErrorMessage})`, () => {
          const container = new Container();

          const functionUnderTest = () =>
            serverBindings.register(container, testCase.config);
          expect(functionUnderTest)
            .to.throw(Error)
            .with.property("message", testCase.expectedErrorMessage);
        });
      }
    );

    const bindingsTestCases: DependencyBindingsTestCase[] = [];
    [
      {
        symbolUnderTestName: ServerStorage.name,
        functionUnderTest: (container: Container) =>
          container.get(ServerStorage),
        expectedCtor: AzureServerStorage,
      },
      {
        symbolUnderTestName: Types.AzureServer.config.toString(),
        functionUnderTest: (container: Container) =>
          container.get<AzureServerStorageConfig>(Types.AzureServer.config),
        expectedCtor: Object,
      },
      {
        symbolUnderTestName: BlobServiceClientWrapper.name,
        functionUnderTest: (container: Container) =>
          container.get(BlobServiceClientWrapper),
        expectedCtor: BlobServiceClientWrapper,
      },
      {
        symbolUnderTestName: BlobServiceClient.name,
        functionUnderTest: (container: Container) =>
          container.get(BlobServiceClient),
        expectedCtor: BlobServiceClient,
      },
    ];
    testBindings(serverBindings, config, bindingsTestCases);
  });
});
