/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { TypedDependencyConfig } from "@itwin/cloud-agnostic-core";
import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { S3ClientStorageBindings } from "../../../client";
import { Constants } from "../../../common";
import { S3ServerStorageBindings } from "../../../server";
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
    },
  } as TypedDependencyConfig,
};

// Uploading a file with metadata to a presigned URL does not work on S3: SigV4
// requires every x-amz-* header to be signed, but the URL is signed without
// knowing the metadata.
const mochaGrepPattern = "(?!.*?file with metadata.*to URL)^.*$";

const tests = new StorageIntegrationTests(
  config,
  S3ServerStorageBindings,
  S3ClientStorageBindings,
  dependencyName,
  mochaGrepPattern
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
