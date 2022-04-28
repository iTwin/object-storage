/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const setupScriptFileName = "OssFrontendTestSetup.js";
const bundledScriptFileName = setupScriptFileName;

const webpackConfig = {
  mode: "development",
  optimization: {
    minimize: false
  },
  entry: {
    app: path.resolve(__dirname, "lib", "test", "frontend", setupScriptFileName)
  },
  output: {
    filename: bundledScriptFileName,
    path: path.resolve(__dirname, "dist")
  },
};

module.exports = {
  default: webpackConfig,
  bundledScriptFileName
};
