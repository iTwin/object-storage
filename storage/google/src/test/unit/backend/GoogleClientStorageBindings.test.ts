/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { Container } from "inversify";

import { ClientStorage } from "@itwin/object-storage-core";
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
        testedFunction: (container: Container) => container.get(ClientStorage),
        expectedCtor: GoogleClientStorage,
      },
      {
        testedClassIdentifier: ClientStorageWrapperFactory.name,
        testedFunction: (container: Container) =>
          container.get(ClientStorageWrapperFactory),
        expectedCtor: ClientStorageWrapperFactory,
      },
    ];
    testBindings(clientBindings, undefined, bindingsTestCases);
  });
});
