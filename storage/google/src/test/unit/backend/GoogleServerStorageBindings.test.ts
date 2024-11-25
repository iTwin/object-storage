/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ServerStorage } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  InvalidConfigTestCase,
  testBindings,
  testInvalidServerConfig,
} from "@itwin/object-storage-tests-backend-unit";

import { Types } from "../../../common";
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
          dependencyName: "google",
        } as unknown as GoogleServerStorageBindingsConfig,
        expectedErrorMessage: "projectId is not defined in configuration",
      },
      {
        config: {
          dependencyName: "google",
          projectId: "testProjectId",
        } as unknown as GoogleServerStorageBindingsConfig,
        expectedErrorMessage: "bucketName is not defined in configuration",
      },
    ];
    testInvalidServerConfig(serverBindings, invalidConfigTestCases);

    const config: GoogleServerStorageBindingsConfig = {
      dependencyName: "google",
      projectId: "testProjectId",
      bucketName: "testBucketName",
    };
    const bindingsTestCases: DependencyBindingsTestCase[] = [];
    [
      {
        testedClassIdentifier: ServerStorage.name,
        testedFunction: (container: Container) => container.get(ServerStorage),
        expectedCtor: GoogleServerStorage,
      },
      {
        testedClassIdentifier: Types.GoogleServer.config.toString(),
        testedFunction: (container: Container) =>
          container.get<GoogleServerStorageBindingsConfig>(
            Types.GoogleServer.config
          ),
        expectedCtor: Object,
      },
      {
        testedClassIdentifier: StorageControlClientWrapper.name,
        testedFunction: (container: Container) =>
          container.get(StorageControlClientWrapper),
        expectedCtor: StorageControlClientWrapper,
      },
      {
        testedClassIdentifier: StorageWrapperFactory.name,
        testedFunction: (container: Container) =>
          container.get(StorageWrapperFactory),
        expectedCtor: StorageWrapperFactory,
      },
      {
        testedClassIdentifier: StorageWrapper.name,
        testedFunction: (container: Container) => container.get(StorageWrapper),
        expectedCtor: StorageWrapper,
      },
    ];
    testBindings(serverBindings, config, bindingsTestCases);
  });
});
