/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { createStubInstance } from "sinon";

import { DIContainer } from "@itwin/cloud-agnostic-core";
import { StorageUnitTests } from "@itwin/object-storage-tests-backend-unit";

import { GoogleClientStorageBindings } from "../../../client";
import {
  GoogleServerStorageBindings,
  GoogleServerStorageBindingsConfig,
  StorageWrapper,
} from "../../../server";
import { StorageControlClientWrapper } from "../../../server/wrappers/StorageControlClientWrapper";

const dependencyName = "google";
const googleTestConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName,
    projectId: "testProjectId",
    bucketName: "testBucketName",
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName,
  },
};

class TestGoogleServerStorageBindings extends GoogleServerStorageBindings {
  public override register(
    container: DIContainer,
    config: GoogleServerStorageBindingsConfig
  ): void {
    super.register(container, config);

    const mockStorageControlClient = createStubInstance(
      StorageControlClientWrapper
    );
    const mockStorageWrapper = createStubInstance(StorageWrapper);

    container.unregister(StorageControlClientWrapper);
    container.registerInstance(
      StorageControlClientWrapper,
      mockStorageControlClient
    );
    container.unregister(StorageWrapper);
    container.registerInstance(StorageWrapper, mockStorageWrapper);
  }
}

class TestGoogleClientStorageBindings extends GoogleClientStorageBindings {
  public override register(container: DIContainer): void {
    super.register(container);

    const mockStorageWrapper = createStubInstance(StorageWrapper);

    container.unregister(StorageWrapper);
    container.registerInstance(StorageWrapper, mockStorageWrapper);
  }
}

const tests = new StorageUnitTests(
  googleTestConfig,
  TestGoogleServerStorageBindings,
  TestGoogleClientStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
