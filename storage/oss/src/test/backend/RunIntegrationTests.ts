/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import {
  S3ClientStorageBindings,
  S3FrontendStorageBindings,
} from "@itwin/object-storage-s3";
import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { OssServerStorageBindings } from "../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const serverStorageConfig = new ServerStorageConfigProvider().get();
const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName: "oss",
    ...serverStorageConfig,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName: "s3",
    bucket: serverStorageConfig.bucket,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName: "s3",
    bucket: serverStorageConfig.bucket,
  },
};

const tests = new StorageIntegrationTests(
  config,
  OssServerStorageBindings,
  S3ClientStorageBindings,
  S3FrontendStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
