/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import {
  MinioClientStorageBindings,
  MinioFrontendStorageBindings,
  MinioServerStorageBindings,
} from "..";

const dependencyName = "minio";
const bucket = "integration-test";
const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName,
    bucket,
    // cspell:disable-next-line
    accessKey: "minioadmin",
    // cspell:disable-next-line
    secretKey: "minioadmin",
    baseUrl: "http://127.0.0.1:9000",
    region: "us-east-1",
    roleArn: "<role-arn>",
    stsBaseUrl: "http://127.0.0.1:9000",
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName,
    bucket,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName,
    bucket,
  },
};

const tests = new StorageIntegrationTests(
  config,
  MinioServerStorageBindings,
  MinioClientStorageBindings,
  MinioFrontendStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
