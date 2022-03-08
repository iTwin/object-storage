/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { S3ClientStorageBindings } from "@itwin/object-storage-s3";
import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import { OssServerStorageBindings } from "../OssServerStorageBindings";

const bucket = process.env.TEST_OSS_BUCKET;

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName: "oss",
    bucket,
    accessKey: process.env.TEST_OSS_ACCESS_KEY,
    secretKey: process.env.TEST_OSS_SECRET_KEY,
    baseUrl: process.env.TEST_OSS_BASE_URL,
    region: process.env.TEST_OSS_REGION,
    roleArn: process.env.TEST_OSS_ROLE_ARN,
    stsBaseUrl: process.env.TEST_OSS_STS_BASE_URL,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName: "s3",
    bucket,
  },
};

const tests = new StorageIntegrationTests(
  config,
  OssServerStorageBindings,
  S3ClientStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
