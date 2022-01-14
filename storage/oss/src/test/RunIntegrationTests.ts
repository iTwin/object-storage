/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import "reflect-metadata";

import { S3ClientSideStorageExtension } from "@itwin/object-storage-s3";
import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import { OssServerSideStorageExtension } from "../OssServerSideStorageExtension";

const bucket = process.env.test_oss_bucket;

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerSideStorage: {
    extensionName: "oss",
    bucket,
    accessKey: process.env.test_oss_access_key,
    secretKey: process.env.test_oss_secret_key,
    baseUrl: process.env.test_oss_base_url,
    roleArn: process.env.test_oss_role_arn,
    stsBaseUrl: process.env.test_oss_sts_base_url,
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
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
