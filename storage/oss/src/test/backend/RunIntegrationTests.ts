/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import {
  S3ClientStorageBindings,
  S3FrontendStorageBindings,
} from "@itwin/object-storage-s3";
import { StorageIntegrationTests } from "@itwin/object-storage-tests";

import { OssServerStorageBindings } from "../../server";
import { TestConfigProvider } from "../TestConfigProvider";


const configProvider = new TestConfigProvider();
const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName: "oss",
    ...configProvider.getServerStorageConfig()
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName: "s3",
    ...configProvider.getFrontendStorageConfig()
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName: "s3",
    ...configProvider.getFrontendStorageConfig()
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
