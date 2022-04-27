/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3FrontendStorageBindings } from "@itwin/object-storage-s3/lib/frontend";
import { FrontendStorageSetter } from "@itwin/object-storage-tests-frontend/lib/FrontendStorageSetter";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName: "s3",
    bucket: "foo", // TODO: pass correct bucket
  },
};
const storageSetter = new FrontendStorageSetter(
  config,
  S3FrontendStorageBindings
);
storageSetter.setStorageOnWindow();
