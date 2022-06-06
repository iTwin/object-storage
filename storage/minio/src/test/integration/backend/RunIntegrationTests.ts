/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { MinioClientStorageBindings } from "../../../client";
import { MinioServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const dependencyName = "minio";
const serverStorageConfig = new ServerStorageConfigProvider().get();
const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName,
    ...serverStorageConfig,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName,
    bucket: serverStorageConfig.bucket,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName,
    bucket: serverStorageConfig.bucket,
  },
};

const tests = new StorageIntegrationTests(
  config,
  MinioServerStorageBindings,
  MinioClientStorageBindings
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
