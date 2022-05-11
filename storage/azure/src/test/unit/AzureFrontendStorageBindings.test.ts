/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { FrontendStorage, Types } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit";

import {
  AzureFrontendStorage,
  AzureFrontendStorageBindings,
  BlockBlobClientWrapperFactory,
} from "../../frontend";

describe(`${AzureFrontendStorageBindings.name}`, () => {
  const frontendBindings = new AzureFrontendStorageBindings();

  describe(`${frontendBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: FrontendStorage.name,
        testedFunction: (container: Container) =>
          container.get(FrontendStorage),
        expectedCtor: AzureFrontendStorage,
      },
      {
        testedClassIdentifier: Types.Frontend.clientWrapperFactory.toString(),
        testedFunction: (container: Container) =>
          container.get<BlockBlobClientWrapperFactory>(
            Types.Frontend.clientWrapperFactory
          ),
        expectedCtor: BlockBlobClientWrapperFactory,
      },
    ];
    testBindings(frontendBindings, undefined, bindingsTestCases);
  });
});
