/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { TypedDependencyConfig } from "@itwin/cloud-agnostic-core";
import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { MinioClientStorageBindings } from "../../../client";
import { Constants } from "../../../common";
import { MinioServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const dependencyName = Constants.storageType;
const serverStorageConfig = new ServerStorageConfigProvider().get();
const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    bindingStrategy: "NamedDependency",
    instances: [
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
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
      bucket: serverStorageConfig.bucket,
    },
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
      bucket: serverStorageConfig.bucket,
    },
  } as TypedDependencyConfig,
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
  dependencyName,
  mochaGrepPattern
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
