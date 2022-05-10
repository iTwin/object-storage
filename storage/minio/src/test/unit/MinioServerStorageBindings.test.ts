/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";
import { Client } from "minio";

import {
  PresignedUrlProvider,
  ServerStorage,
  Types,
} from "@itwin/object-storage-core";
import {
  Constants,
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-unit";

import {
  MinioPresignedUrlProvider,
  MinioServerStorage,
  MinioServerStorageBindings,
} from "../../server";

describe(`${MinioServerStorageBindings.name}`, () => {
  const serverBindings = new MinioServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: ServerStorage.name,
        testedFunction: (container: Container) => container.get(ServerStorage),
        expectedCtor: MinioServerStorage,
      },
      {
        testedClassIdentifier: Types.Server.presignedUrlProvider.toString(),
        testedFunction: (container: Container) =>
          container.get<PresignedUrlProvider>(
            Types.Server.presignedUrlProvider
          ),
        expectedCtor: MinioPresignedUrlProvider,
      },
      {
        testedClassIdentifier: Client.name,
        testedFunction: (container: Container) => container.get(Client),
        expectedCtor: Client,
      },
    ];
    testBindings(
      serverBindings,
      Constants.validS3ServerStorageConfig,
      bindingsTestCases
    );
  });
});
