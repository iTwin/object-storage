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
  AzureClientStorage,
  AzureClientStorageBindings,
} from "../../../client";
import { Types } from "../../../common";
import {
  BlobClientWrapperFactory,
  BlockBlobClientWrapperFactory,
  ContainerClientWrapperFactory,
} from "../../../server/wrappers";

describe(`${AzureClientStorageBindings.name}`, () => {
  const clientBindings = new AzureClientStorageBindings();

  describe(`${clientBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: ClientStorage.name,
        testedFunction: (container: Container) => container.get(ClientStorage),
        expectedCtor: AzureClientStorage,
      },
      {
        testedClassIdentifier:
          Types.Client.blockBlobClientWrapperFactory.toString(),
        testedFunction: (container: Container) =>
          container.get<BlockBlobClientWrapperFactory>(
            Types.Client.blockBlobClientWrapperFactory
          ),
        expectedCtor: BlockBlobClientWrapperFactory,
      },
      {
        testedClassIdentifier: Types.Client.blobClientWrapperFactory.toString(),
        testedFunction: (container: Container) =>
          container.get<BlobClientWrapperFactory>(
            Types.Client.blobClientWrapperFactory
          ),
        expectedCtor: BlobClientWrapperFactory,
      },
      {
        testedClassIdentifier:
          Types.Client.containerClientWrapperFactory.toString(),
        testedFunction: (container: Container) =>
          container.get<ContainerClientWrapperFactory>(
            Types.Client.containerClientWrapperFactory
          ),
        expectedCtor: ContainerClientWrapperFactory,
      },
    ];
    testBindings(clientBindings, undefined, bindingsTestCases);
  });
});
