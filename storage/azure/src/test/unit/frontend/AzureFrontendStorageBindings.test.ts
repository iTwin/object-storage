/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  FrontendStorage,
  Types,
} from "@itwin/object-storage-core/lib/frontend";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit/lib/shared/test-templates/BindingsTests";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import {
  AzureFrontendStorage,
  AzureFrontendStorageBindings,
  FrontendBlockBlobClientWrapperFactory,
} from "../../../frontend";

describe(`${AzureFrontendStorageBindings.name}`, () => {
  const frontendBindings = new AzureFrontendStorageBindings();

  describe(`${frontendBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: FrontendStorage.name,
        testedFunction: (c: DIContainer) => c.resolve(FrontendStorage),
        expectedCtor: AzureFrontendStorage,
      },
      {
        testedClassIdentifier: Types.Frontend.clientWrapperFactory.toString(),
        testedFunction: (c: DIContainer) =>
          c.resolve<FrontendBlockBlobClientWrapperFactory>(
            Types.Frontend.clientWrapperFactory
          ),
        expectedCtor: FrontendBlockBlobClientWrapperFactory,
      },
    ];
    testBindings(frontendBindings, undefined, bindingsTestCases);
  });
});
