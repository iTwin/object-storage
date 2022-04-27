/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";

import { FrontendStorageIntegrationTests } from "@itwin/object-storage-tests-frontend";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { bundledScriptFileName } = require(path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "webpack.config.js"
));
const bundledSetupScript = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "dist",
  bundledScriptFileName
);

const tests = new FrontendStorageIntegrationTests(bundledSetupScript);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
