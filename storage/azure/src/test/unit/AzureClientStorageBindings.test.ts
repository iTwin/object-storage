/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ClientStorage, Types } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-unit";

import { AzureClientStorage, AzureClientStorageBindings } from "../../client";
import { BlockBlobClientWrapperFactory } from "../../frontend";

describe(`${AzureClientStorageBindings.name}`, () => {
  const clientBindings = new AzureClientStorageBindings();

  describe(`${clientBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        symbolUnderTestName: ClientStorage.name,
        functionUnderTest: (container: Container) =>
          container.get(ClientStorage),
        expectedCtor: AzureClientStorage,
      },
      {
        symbolUnderTestName: Types.Client.clientWrapperFactory.toString(),
        functionUnderTest: (container: Container) =>
          container.get<BlockBlobClientWrapperFactory>(
            Types.Client.clientWrapperFactory
          ),
        expectedCtor: BlockBlobClientWrapperFactory,
      },
    ];
    testBindings(clientBindings, undefined, bindingsTestCases);
  });
});
