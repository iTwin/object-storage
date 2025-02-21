/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { DIContainer } from "@itwin/cloud-agnostic-core";
import { ClientStorage, Types as CoreTypes } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit";

import {
  GoogleClientStorage,
  GoogleClientStorageBindings,
} from "../../../client";
import { ClientStorageWrapperFactory } from "../../../client/wrappers";

describe(`${GoogleClientStorageBindings.name}`, () => {
  const clientBindings = new GoogleClientStorageBindings();

  describe(`${clientBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: ClientStorage.name,
        testedFunction: (c: DIContainer) =>
          c.resolve<ClientStorage>(CoreTypes.Client.clientStorage),
        expectedCtor: GoogleClientStorage,
      },
      {
        testedClassIdentifier: ClientStorageWrapperFactory.name,
        testedFunction: (c: DIContainer) =>
          c.resolve(ClientStorageWrapperFactory),
        expectedCtor: ClientStorageWrapperFactory,
      },
    ];
    testBindings(clientBindings, undefined, bindingsTestCases);
  });
});
