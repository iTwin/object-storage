/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require("webpack");

const setupScriptFileName = "S3FrontendTestSetup.js";
const bundledScriptFileName = setupScriptFileName;

const webpackConfig = {
  mode: "development",
  optimization: {
    minimize: false
  },
  plugins: [
    new webpack.DefinePlugin({ __filename: JSON.stringify("") }),
    // Cypress loads only the single bundled setup script, so dynamic imports
    // (e.g. in @smithy/core) must not be emitted as separate chunks.
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
  ],
  entry: {
    app: path.resolve(__dirname, "lib", "test", "integration", "frontend", setupScriptFileName)
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
