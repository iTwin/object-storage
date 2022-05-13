/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";
import { Container } from "inversify";

import { StorageUnitTests } from "@itwin/object-storage-tests-backend-unit";

import { S3ClientStorageBindings } from "../../../client";
import {
  S3ServerStorageBindings,
  S3ServerStorageBindingsConfig,
} from "../../../server";

import {
  rebindS3Client,
  rebindS3Server,
  s3TestConfig,
} from "./CommonUnitTestUtils";

class TestS3ServerStorageBindings extends S3ServerStorageBindings {
  public override register(
    container: Container,
    config: S3ServerStorageBindingsConfig
  ): void {
    super.register(container, config);
    rebindS3Server(container);
  }
}

class TestS3ClientStorageBindings extends S3ClientStorageBindings {
  public override register(container: Container): void {
    super.register(container);
    rebindS3Client(container);
  }
}

const tests = new StorageUnitTests(
  s3TestConfig,
  TestS3ServerStorageBindings,
  TestS3ClientStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
