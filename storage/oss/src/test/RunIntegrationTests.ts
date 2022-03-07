/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import "reflect-metadata";

import { S3ClientSideStorageBindings } from "@itwin/object-storage-s3";
import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import { OssServerSideStorageBindings } from "../OssServerSideStorageBindings";

const bucket = process.env.TEST_OSS_BUCKET;

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerSideStorage: {
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
  ClientSideStorage: {
    dependencyName: "s3",
    bucket,
  },
};

const tests = new StorageIntegrationTests(
  config,
  OssServerSideStorageBindings,
  S3ClientSideStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
