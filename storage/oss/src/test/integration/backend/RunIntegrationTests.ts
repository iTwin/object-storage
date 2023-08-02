/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { S3ClientStorageBindings } from "@itwin/object-storage-s3";
import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { OssServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const serverStorageConfig = new ServerStorageConfigProvider().get();
const config = {
  ServerStorage: [
    {
      dependencyName: "oss",
      instanceName: "primary",
      ...serverStorageConfig,
    },
    {
      dependencyName: "oss",
      instanceName: "secondary",
      ...serverStorageConfig,
    },
  ],
  ClientStorage: {
    dependencyName: "s3",
    bucket: serverStorageConfig.bucket,
  },
  FrontendStorage: {
    dependencyName: "s3",
    bucket: serverStorageConfig.bucket,
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
