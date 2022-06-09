/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorageTestSetup } from "@itwin/object-storage-tests-frontend/lib/FrontendStorageTestSetup";

import { OssFrontendStorageBindings } from "../../../frontend";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName: "s3",
  },
};
const setup = new FrontendStorageTestSetup(
  config,
  OssFrontendStorageBindings,
  "http://localhost:1223"
);
setup.setGlobals();
