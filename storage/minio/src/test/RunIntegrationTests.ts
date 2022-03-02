/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import "reflect-metadata";

// import { StorageIntegrationTests } from "@itwin/object-storage-tests";

// import {
//   MinioClientSideStorageExtension,
//   MinioServerSideStorageExtension,
// } from "..";

import { MinioProcess } from "./MinioProcess";

const bucket = "integration-test";
// const config = {
//   // eslint-disable-next-line @typescript-eslint/naming-convention
//   ServerSideStorage: {
//     extensionName: "minio",
//     bucket,
//     // cspell:disable-next-line
//     accessKey: "minioadmin",
//     // cspell:disable-next-line
//     secretKey: "minioadmin",
//     baseUrl: "http://127.0.0.1:9000",
//     region: "us-east-1",
//     roleArn: "<role-arn>",
//     stsBaseUrl: "http://127.0.0.1:9000",
//   },
//   // eslint-disable-next-line @typescript-eslint/naming-convention
//   ClientSideStorage: {
//     extensionName: "minio",
//     bucket,
//   },
// };

async function runTests(): Promise<void> {
  const minioProcess = new MinioProcess();
  // const tests = new StorageIntegrationTests(
  //   config,
  //   MinioServerSideStorageExtension,
  //   MinioClientSideStorageExtension
  // );

  await minioProcess.start(bucket);
  try {
    // await tests.start();
  } catch (err) {
    process.exitCode = 1;
    throw err;
  } finally {
    minioProcess.terminate();
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runTests();
