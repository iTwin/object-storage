/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createStubInstance } from "sinon";

import { DIContainer, TypedDependencyConfig } from "@itwin/cloud-agnostic-core";
import { StorageUnitTests } from "@itwin/object-storage-tests-backend-unit";

import { GoogleClientStorageBindings } from "../../../client";
import { ClientStorageWrapperFactory } from "../../../client/wrappers";
import {
  Constants,
  GoogleServerStorageBindings,
  GoogleServerStorageBindingsConfig,
  StorageWrapper,
} from "../../../server";
import { StorageControlClientWrapper } from "../../../server/wrappers/StorageControlClientWrapper";

const dependencyName = Constants.storageType;
const googleTestConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    bindingStrategy: "Dependency",
    instance: {
      dependencyName,
      projectId: "testProjectId",
      bucketName: "testBucketName",
    },
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
    },
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
    },
  } as TypedDependencyConfig,
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
    const mockStorageWrapperFactory = createStubInstance(
      ClientStorageWrapperFactory
    );
    mockStorageWrapperFactory.createFromToken.returns(mockStorageWrapper);

    container.unregister(ClientStorageWrapperFactory);
    container.registerInstance(
      ClientStorageWrapperFactory,
      mockStorageWrapperFactory
    );
  }
}

const tests = new StorageUnitTests(
  googleTestConfig,
  TestGoogleServerStorageBindings,
  TestGoogleClientStorageBindings,
  dependencyName
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
