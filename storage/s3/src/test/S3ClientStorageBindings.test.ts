/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ClientStorage, Types as CoreTypes } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-unit";

import { S3ClientStorage, S3ClientStorageBindings } from "../client";
import { S3ClientWrapperFactory } from "../frontend";

describe(`${S3ClientStorageBindings.name}`, () => {
  const clientBindings = new S3ClientStorageBindings();

  describe(`${clientBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        symbolUnderTestName: CoreTypes.Client.clientWrapperFactory.toString(),
        functionUnderTest: (container: Container) =>
          container.get<S3ClientWrapperFactory>(
            CoreTypes.Client.clientWrapperFactory
          ),
        expectedCtor: S3ClientWrapperFactory,
      },
      {
        symbolUnderTestName: ClientStorage.name,
        functionUnderTest: (container: Container) =>
          container.get(ClientStorage),
        expectedCtor: S3ClientStorage,
      },
    ];
    testBindings(clientBindings, undefined, bindingsTestCases);
  });
});