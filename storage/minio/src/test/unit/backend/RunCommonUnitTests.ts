/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { Container } from "inversify";
import { Client } from "minio";
import { createStubInstance } from "sinon";

import {
  rebindS3Client,
  rebindS3Server,
  s3TestConfig,
} from "@itwin/object-storage-s3/lib/test/unit/backend/CommonUnitTestUtils";

import { S3ServerStorageBindingsConfig } from "@itwin/object-storage-s3";
import { StorageUnitTests } from "@itwin/object-storage-tests-backend-unit";

import { MinioClientStorageBindings } from "../../../client";
import { MinioServerStorageBindings } from "../../../server";

const dependencyName = "minio";
const minioTestConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    ...s3TestConfig.ServerStorage,
    dependencyName,
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

class TestMinioServerStorageBindings extends MinioServerStorageBindings {
  public override register(
    container: Container,
    config: S3ServerStorageBindingsConfig
  ): void {
    super.register(container, config);
    rebindS3Server(container);

    const mockClient = createStubInstance(Client);

    container.rebind(Client).toConstantValue(mockClient);
  }
}

class TestMinioClientStorageBindings extends MinioClientStorageBindings {
  public override register(container: Container): void {
    super.register(container);
    rebindS3Client(container);
  }
}

const tests = new StorageUnitTests(
  minioTestConfig,
  TestMinioServerStorageBindings,
  TestMinioClientStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
