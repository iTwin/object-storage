/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendStorage,
  Types as CoreTypes,
} from "@itwin/object-storage-core/lib/frontend";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit/lib/shared/test-templates/BindingsTests";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import {
  MinioFrontendStorage,
  MinioFrontendStorageBindings,
} from "../../../frontend";

describe(`${MinioFrontendStorageBindings.name}`, () => {
  const frontendBindings = new MinioFrontendStorageBindings();

  describe(`${frontendBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: FrontendStorage.name,
        testedFunction: (c: DIContainer) =>
          c.resolve<FrontendStorage>(CoreTypes.Frontend.frontendStorage),
        expectedCtor: MinioFrontendStorage,
      },
    ];
    testBindings(frontendBindings, undefined, bindingsTestCases);
  });
});
