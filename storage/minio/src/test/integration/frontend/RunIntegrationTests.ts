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

// There is a known bug with newest versions of MinIO which now behaves in the same manner as AWS S3.
// File upload with metadata using signed URL does not work because we do not include metadata headers when
// signing the url.
// For now we do not run these tests.
// Bug #1255566
const tests = new FrontendStorageIntegrationTests(bundledSetupScript, {
  SKIP_FILE_WITH_METADATA_UPLOAD_TO_URL: "1",
});
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
