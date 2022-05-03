/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { Container } from "inversify";

import { FrontendStorage, Types } from "@itwin/object-storage-core";

import {
  AzureFrontendStorageBindings,
  BlockBlobClientWrapperFactory,
} from "../../frontend";

describe(`${AzureFrontendStorageBindings.name}`, () => {
  const frontendBindings = new AzureFrontendStorageBindings();

  describe(`${frontendBindings.register.name}()`, () => {
    [
      {
        symbolUnderTestName: FrontendStorage.name,
        functionUnderTest: (container: Container) =>
          container.get(FrontendStorage),
      },
      {
        symbolUnderTestName: Types.Frontend.clientWrapperFactory.toString(),
        functionUnderTest: (container: Container) =>
          container.get<BlockBlobClientWrapperFactory>(
            Types.Frontend.clientWrapperFactory
          ),
      },
    ].forEach(
      (testCase: {
        symbolUnderTestName: string;
        functionUnderTest: (container: Container) => unknown;
      }) => {
        it(`should register ${testCase.symbolUnderTestName}`, () => {
          const container = new Container();
          frontendBindings.register(container);

          const functionUnderTest = () => testCase.functionUnderTest(container);
          expect(functionUnderTest).to.not.throw();
        });

        it(`should register ${testCase.symbolUnderTestName} as a singleton`, () => {
          const container = new Container();
          frontendBindings.register(container);
          const instance1 = testCase.functionUnderTest(container);
          const instance2 = testCase.functionUnderTest(container);

          expect(instance1).to.be.equal(instance2);
        });
      }
    );
  });
});
