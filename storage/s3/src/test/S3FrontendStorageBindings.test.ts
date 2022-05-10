/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  Types as CoreTypes,
  FrontendStorage,
} from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-unit";

import {
  S3ClientWrapperFactory,
  S3FrontendStorage,
  S3FrontendStorageBindings,
} from "../frontend";

describe(`${S3FrontendStorageBindings.name}`, () => {
  const frontendBindings = new S3FrontendStorageBindings();

  describe(`${frontendBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier:
          CoreTypes.Frontend.clientWrapperFactory.toString(),
        testedFunction: (container: Container) =>
          container.get<S3ClientWrapperFactory>(
            CoreTypes.Frontend.clientWrapperFactory
          ),
        expectedCtor: S3ClientWrapperFactory,
      },
      {
        testedClassIdentifier: FrontendStorage.name,
        testedFunction: (container: Container) =>
          container.get(FrontendStorage),
        expectedCtor: S3FrontendStorage,
      },
    ];
    testBindings(frontendBindings, undefined, bindingsTestCases);
  });
});
