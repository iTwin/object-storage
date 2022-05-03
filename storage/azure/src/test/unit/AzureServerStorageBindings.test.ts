/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlobServiceClient } from "@azure/storage-blob";
import { expect } from "chai";
import { Container } from "inversify";

import { ServerStorage } from "@itwin/object-storage-core";

import { Types } from "../../common";
import {
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

    [
      {
        symbolUnderTestName: ServerStorage.name,
        functionUnderTest: (container: Container) =>
          container.get(ServerStorage),
      },
      {
        symbolUnderTestName: Types.AzureServer.config.toString(),
        functionUnderTest: (container: Container) =>
          container.get<AzureServerStorageConfig>(Types.AzureServer.config),
      },
      {
        symbolUnderTestName: BlobServiceClientWrapper.name,
        functionUnderTest: (container: Container) =>
          container.get(BlobServiceClientWrapper),
      },
      {
        symbolUnderTestName: BlobServiceClient.name,
        functionUnderTest: (container: Container) =>
          container.get(BlobServiceClient),
      },
    ].forEach(
      (testCase: {
        symbolUnderTestName: string;
        functionUnderTest: (container: Container) => unknown;
      }) => {
        it(`should register ${testCase.symbolUnderTestName}`, () => {
          const container = new Container();
          serverBindings.register(container, config);

          const functionUnderTest = () => testCase.functionUnderTest(container);
          expect(functionUnderTest).to.not.throw();
        });

        it(`should register ${testCase.symbolUnderTestName} as a singleton`, () => {
          const container = new Container();
          serverBindings.register(container, config);
          const instance1 = testCase.functionUnderTest(container);
          const instance2 = testCase.functionUnderTest(container);

          expect(instance1).to.be.equal(instance2);
        });
      }
    );
  });
});
