/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageIntegrationTests } from "@itwin/object-storage-tests-backend";

import { GoogleClientStorageBindings } from "../../../client/GoogleClientStorageBindings";
import { GoogleServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

const serverStorageConfig = new ServerStorageConfigProvider().get();
const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: [
    {
      dependencyName: "google",
      instanceName: "primary",
      ...serverStorageConfig,
    },
    {
      dependencyName: "google",
      instanceName: "secondary",
      ...serverStorageConfig,
      bucket: serverStorageConfig.secondaryBucketName,
    },
  ],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName: "google",
    bucket: serverStorageConfig.bucketName,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName: "google",
    bucket: serverStorageConfig.bucketName,
  },
};

/**
 * There is no way to specify expiration time for the tokens
 * without writing our own authentication implementation.
 *
 * There's also no way to specify an abort signal for storage
 * client methods.
 *
 * Object metadata is managed through separate requests from
 * upload and does not work with upload using signed URLs.
 */
const mochaGrepPattern =
  "(?!.*should use (expiresInSeconds|expiresOn) if set|.*should cancel file download to path using transfer config|.*should upload a file with metadata .* to URL)^.*$";

const tests = new StorageIntegrationTests(
  config,
  GoogleServerStorageBindings,
  GoogleClientStorageBindings,
  mochaGrepPattern
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
