/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Client } from "minio";

import { DIContainer } from "@itwin/cloud-agnostic-core";
import {
  PresignedUrlProvider,
  ServerStorage,
  Types,
} from "@itwin/object-storage-core";
import {
  Constants,
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-backend-unit";

import {
  MinioPresignedUrlProvider,
  MinioServerStorage,
  MinioServerStorageBindings,
} from "../../../server";

describe(`${MinioServerStorageBindings.name}`, () => {
  const serverBindings = new MinioServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: ServerStorage.name,
        testedFunction: (c: DIContainer) => c.resolve(ServerStorage),
        expectedCtor: MinioServerStorage,
      },
      {
        testedClassIdentifier: Types.Server.presignedUrlProvider.toString(),
        testedFunction: (c: DIContainer) =>
          c.resolve<PresignedUrlProvider>(Types.Server.presignedUrlProvider),
        expectedCtor: MinioPresignedUrlProvider,
      },
      {
        testedClassIdentifier: Client.name,
        testedFunction: (c: DIContainer) => c.resolve(Client),
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
