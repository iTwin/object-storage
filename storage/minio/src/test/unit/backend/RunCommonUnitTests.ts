/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Client } from "minio";
import { createStubInstance } from "sinon";

import {
  rebindS3Client,
  rebindS3Server,
  s3TestConfig,
} from "@itwin/object-storage-s3/lib/test/unit/backend/CommonUnitTestUtils";

import { DIContainer, TypedDependencyConfig } from "@itwin/cloud-agnostic-core";
import { S3ServerStorageBindingsConfig } from "@itwin/object-storage-s3";
import { StorageUnitTests } from "@itwin/object-storage-tests-backend-unit";

import { MinioClientStorageBindings } from "../../../client";
import { Constants } from "../../../common";
import { MinioServerStorageBindings } from "../../../server";

const dependencyName = Constants.storageType;
const minioTestConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    bindingStrategy: "Dependency",
    instance: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(s3TestConfig.ServerStorage as any).instance,
      dependencyName,
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

class TestMinioServerStorageBindings extends MinioServerStorageBindings {
  public override register(
    container: DIContainer,
    config: S3ServerStorageBindingsConfig
  ): void {
    super.register(container, config);
    rebindS3Server(container);

    const mockClient = createStubInstance(Client);

    container.unregister(Client);
    container.registerInstance(Client, mockClient);
  }
}

class TestMinioClientStorageBindings extends MinioClientStorageBindings {
  public override register(container: DIContainer): void {
    super.register(container);
    rebindS3Client(container);
  }
}

const tests = new StorageUnitTests(
  minioTestConfig,
  TestMinioServerStorageBindings,
  TestMinioClientStorageBindings,
  Constants.storageType
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
