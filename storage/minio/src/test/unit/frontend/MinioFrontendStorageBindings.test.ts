/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { FrontendStorage } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit";

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
        testedFunction: (container: Container) =>
          container.get(FrontendStorage),
        expectedCtor: MinioFrontendStorage,
      },
    ];
    testBindings(frontendBindings, undefined, bindingsTestCases);
  });
});
