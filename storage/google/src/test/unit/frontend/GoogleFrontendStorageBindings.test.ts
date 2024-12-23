/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { FrontendStorage } from "@itwin/object-storage-core/lib/frontend";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit/lib/shared/test-templates/BindingsTests";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import {
  GoogleFrontendStorage,
  GoogleFrontendStorageBindings,
} from "../../../frontend";

describe(`${GoogleFrontendStorageBindings.name}`, () => {
  const frontendBindings = new GoogleFrontendStorageBindings();

  describe(`${frontendBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: FrontendStorage.name,
        testedFunction: (c: DIContainer) => c.resolve(FrontendStorage),
        expectedCtor: GoogleFrontendStorage,
      },
    ];
    testBindings(frontendBindings, undefined, bindingsTestCases);
  });
});
