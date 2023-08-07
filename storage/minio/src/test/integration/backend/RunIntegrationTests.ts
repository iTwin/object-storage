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
  ServerStorage: [
    {
      dependencyName,
      instanceName: "primary",
      ...serverStorageConfig,
    },
    {
      dependencyName,
      instanceName: "secondary",
      ...serverStorageConfig,
      bucket: `${serverStorageConfig.bucket}-2`,
    },
  ],
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

// There is a known bug with newest versions of MinIO which now behaves in the same manner as AWS S3.
// File upload with metadata using signed URL does not work because we do not include metadata headers when
// signing the url.
// For now we do not run these tests.
// Bug #1255566
const mochaGrepPattern = "(?!.*?file with metadata.*to URL)^.*$";

const tests = new StorageIntegrationTests(
  config,
  MinioServerStorageBindings,
  MinioClientStorageBindings,
  mochaGrepPattern
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
