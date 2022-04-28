/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3FrontendStorageBindings } from "@itwin/object-storage-s3/lib/frontend";
import { FrontendStorageTestSetup } from "@itwin/object-storage-tests-frontend/lib/FrontendStorageTestSetup";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName: "s3",
    bucket: "foo", // TODO: pass correct bucket
  },
};
const setup = new FrontendStorageTestSetup(
  config,
  S3FrontendStorageBindings,
  "http://localhost:1223"
);
setup.setGlobals();
