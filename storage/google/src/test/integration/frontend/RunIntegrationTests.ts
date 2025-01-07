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
  "..",
  "webpack.config.js"
));
const bundledSetupScript = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "dist",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  bundledScriptFileName
);

const tests = new FrontendStorageIntegrationTests(bundledSetupScript, {
  SKIP_FILE_WITH_METADATA_UPLOAD_TO_URL: "1",
  SKIP_FILE_WITH_METADATA_UPLOAD_WITH_CONFIG: "1",
});
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
