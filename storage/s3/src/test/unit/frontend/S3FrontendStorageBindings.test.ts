/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  Types as CoreTypes,
  FrontendStorage,
} from "@itwin/object-storage-core/lib/frontend";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit/lib/shared/test-templates/BindingsTests";

import {
  FrontendS3ClientWrapperFactory,
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
          container.get<FrontendS3ClientWrapperFactory>(
            CoreTypes.Frontend.clientWrapperFactory
          ),
        expectedCtor: FrontendS3ClientWrapperFactory,
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
