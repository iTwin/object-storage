/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import {
  MinioClientSideStorageExtension,
  MinioServerSideStorageExtension,
} from "..";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerSideStorage: {
    extensionName: "minio",
    bucket: "integration-test",
    // cspell:disable-next-line
    accessKey: "minioadmin",
    // cspell:disable-next-line
    secretKey: "minioadmin",
    baseUrl: "http://127.0.0.1:9000",
    roleArn: "<role-arn>",
    stsBaseUrl: "http://127.0.0.1:9000",
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientSideStorage: {
    extensionName: "minio",
    bucket: "integration-test",
  },
};

const tests = new StorageIntegrationTests(
  config,
  MinioServerSideStorageExtension,
  MinioClientSideStorageExtension
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
