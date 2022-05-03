/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { Container } from "inversify";

import { ClientStorage, Types } from "@itwin/object-storage-core";

import { AzureClientStorageBindings } from "../../client";
import { BlockBlobClientWrapperFactory } from "../../frontend";

describe(`${AzureClientStorageBindings.name}`, () => {
  const clientBindings = new AzureClientStorageBindings();

  describe(`${clientBindings.register.name}()`, () => {
    [
      {
        symbolUnderTestName: ClientStorage.name,
        functionUnderTest: (container: Container) =>
          container.get(ClientStorage),
      },
      {
        symbolUnderTestName: Types.Client.clientWrapperFactory.toString(),
        functionUnderTest: (container: Container) =>
          container.get<BlockBlobClientWrapperFactory>(
            Types.Client.clientWrapperFactory
          ),
      },
    ].forEach(
      (testCase: {
        symbolUnderTestName: string;
        functionUnderTest: (container: Container) => unknown;
      }) => {
        it(`should register ${testCase.symbolUnderTestName}`, () => {
          const container = new Container();
          clientBindings.register(container);

          const functionUnderTest = () => testCase.functionUnderTest(container);
          expect(functionUnderTest).to.not.throw();
        });

        it(`should register ${testCase.symbolUnderTestName} as a singleton`, () => {
          const container = new Container();
          clientBindings.register(container);
          const instance1 = testCase.functionUnderTest(container);
          const instance2 = testCase.functionUnderTest(container);

          expect(instance1).to.be.equal(instance2);
        });
      }
    );
  });
});
