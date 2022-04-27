/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const setStorageScriptFileName = "SetMinioFrontendStorage.js";
const bundledScriptFileName = setStorageScriptFileName;

const webpackConfig = {
  mode: "development",
  optimization: {
    minimize: false
  },
  entry: {
    app: path.resolve(__dirname, "lib", "test", "frontend", setStorageScriptFileName)
  },
  output: {
    filename: bundledScriptFileName,
    path: path.resolve(__dirname, "dist")
  },
  // TODO: remove after frontend storage is fixed
  resolve: {
    fallback: { "stream": require.resolve("stream-browserify") }
  }
};

module.exports = {
  default: webpackConfig,
  bundledScriptFileName
};
