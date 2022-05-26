/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Types as CoreTypes } from "@itwin/object-storage-core/lib/common";
import { FrontendStorage } from "@itwin/object-storage-core/lib/frontend";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit";
import {
  S3ClientWrapperFactoryFrontend,
  S3FrontendStorage,
  S3FrontendStorageBindings,
} from "../../../frontend";

describe(`${S3FrontendStorageBindings.name}`, () => {
  const frontendBindings = new S3FrontendStorageBindings();

  describe(`${frontendBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier:
          CoreTypes.Frontend.clientWrapperFactory.toString(),
        testedFunction: (container: Container) =>
          container.get<S3ClientWrapperFactoryFrontend>(
            CoreTypes.Frontend.clientWrapperFactory
          ),
        expectedCtor: S3ClientWrapperFactoryFrontend,
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
