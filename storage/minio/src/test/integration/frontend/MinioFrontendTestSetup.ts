/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { FrontendStorageTestSetup } from "@itwin/object-storage-tests-frontend/lib/FrontendStorageTestSetup";

import { MinioFrontendStorageBindings } from "../../../frontend";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName: "minio",
  },
};
const setup = new FrontendStorageTestSetup(
  config,
  MinioFrontendStorageBindings,
  "http://localhost:1222"
);
setup.setGlobals();
