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
  AzureClientStorage,
  AzureClientStorageBindings,
} from "../../../client";
import { BlockBlobClientWrapperFactory } from "../../../server/wrappers";

describe(`${AzureClientStorageBindings.name}`, () => {
  const clientBindings = new AzureClientStorageBindings();

  describe(`${clientBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: ClientStorage.name,
        testedFunction: (c: DIContainer) =>
          c.resolve<ClientStorage>(CoreTypes.Client.clientStorage),
        expectedCtor: AzureClientStorage,
      },
      {
        testedClassIdentifier: CoreTypes.Client.clientWrapperFactory.toString(),
        testedFunction: (c: DIContainer) =>
          c.resolve<BlockBlobClientWrapperFactory>(
            CoreTypes.Client.clientWrapperFactory
          ),
        expectedCtor: BlockBlobClientWrapperFactory,
      },
    ];
    testBindings(clientBindings, undefined, bindingsTestCases);
  });
});
