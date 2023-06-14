/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { Container } from "inversify";

import { ClientStorage, Types as CoreTypes } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit";

import { S3ClientStorage, S3ClientStorageBindings } from "../../../client";
import { S3ClientWrapperFactory } from "../../../server";

describe(`${S3ClientStorageBindings.name}`, () => {
  const clientBindings = new S3ClientStorageBindings();

  describe(`${clientBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: CoreTypes.Client.clientWrapperFactory.toString(),
        testedFunction: (container: Container) =>
          container.get<S3ClientWrapperFactory>(
            CoreTypes.Client.clientWrapperFactory
          ),
        expectedCtor: S3ClientWrapperFactory,
      },
      {
        testedClassIdentifier: ClientStorage.name,
        testedFunction: (container: Container) => container.get(ClientStorage),
        expectedCtor: S3ClientStorage,
      },
    ];
    testBindings(clientBindings, undefined, bindingsTestCases);
  });
});
