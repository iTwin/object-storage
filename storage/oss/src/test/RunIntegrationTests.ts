/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import "reflect-metadata";

import { S3ClientSideStorageExtension } from "@itwin/object-storage-s3";
import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import { OssServerSideStorageExtension } from "../OssServerSideStorageExtension";

const bucket = process.env.TEST_OSS_BUCKET;

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerSideStorage: {
    extensionName: "oss",
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
    extensionName: "s3",
    bucket,
  },
};

const tests = new StorageIntegrationTests(
  config,
  OssServerSideStorageExtension,
  S3ClientSideStorageExtension
);
tests
  .start()
  .catch((err) => {
    process.exitCode = 1;
    throw err;
  })
  .finally(() => tests.releaseResources);
