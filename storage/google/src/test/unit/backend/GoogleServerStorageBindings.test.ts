/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { DIContainer } from "@itwin/cloud-agnostic-core";
import { ServerStorage, Types as CoreTypes } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  InvalidConfigTestCase,
  testBindings,
  testInvalidServerConfig,
} from "@itwin/object-storage-tests-backend-unit";

import { Constants, Types } from "../../../common";
import {
  GoogleServerStorageBindings,
  GoogleServerStorageBindingsConfig,
  GoogleServerStorage,
  StorageWrapperFactory,
  StorageWrapper,
} from "../../../server";
import { StorageControlClientWrapper } from "../../../server/wrappers/StorageControlClientWrapper";

describe(`${GoogleServerStorageBindings.name}`, () => {
  const serverBindings = new GoogleServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
    const invalidConfigTestCases: InvalidConfigTestCase[] = [
      {
        config: {
          dependencyName: Constants.storageType,
        } as unknown as GoogleServerStorageBindingsConfig,
        expectedErrorMessage: "projectId is not defined in configuration",
      },
      {
        config: {
          dependencyName: Constants.storageType,
          projectId: "testProjectId",
        } as unknown as GoogleServerStorageBindingsConfig,
        expectedErrorMessage: "bucketName is not defined in configuration",
      },
    ];
    testInvalidServerConfig(serverBindings, invalidConfigTestCases);

    const config: GoogleServerStorageBindingsConfig = {
      dependencyName: Constants.storageType,
      projectId: "testProjectId",
      bucketName: "testBucketName",
    };
    const bindingsTestCases: DependencyBindingsTestCase[] = [];
    [
      {
        testedClassIdentifier: ServerStorage.name,
        testedFunction: (c: DIContainer) =>
          c.resolve<ServerStorage>(CoreTypes.Server.serverStorage),
        expectedCtor: GoogleServerStorage,
      },
      {
        testedClassIdentifier: Types.GoogleServer.config.toString(),
        testedFunction: (c: DIContainer) =>
          c.resolve<GoogleServerStorageBindingsConfig>(
            Types.GoogleServer.config
          ),
        expectedCtor: Object,
      },
      {
        testedClassIdentifier: StorageControlClientWrapper.name,
        testedFunction: (c: DIContainer) =>
          c.resolve(StorageControlClientWrapper),
        expectedCtor: StorageControlClientWrapper,
      },
      {
        testedClassIdentifier: StorageWrapperFactory.name,
        testedFunction: (c: DIContainer) => c.resolve(StorageWrapperFactory),
        expectedCtor: StorageWrapperFactory,
      },
      {
        testedClassIdentifier: StorageWrapper.name,
        testedFunction: (c: DIContainer) => c.resolve(StorageWrapper),
        expectedCtor: StorageWrapper,
      },
    ];
    testBindings(serverBindings, config, bindingsTestCases);
  });
});
