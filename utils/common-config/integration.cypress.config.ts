/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { defineConfig } from "cypress"
import webpackPreprocessor from "@cypress/webpack-batteries-included-preprocessor";
import * as typescript from "typescript";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWebpackOptions(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = (webpackPreprocessor as any).getFullWebpackOptions(undefined, typescript);
  const fallback = options.resolve.fallback;
  fallback.crypto = "crypto-browserify";
  fallback.events = "events";
  fallback.https = "https-browserify";
  fallback.http = "stream-http";
  fallback.url = "url";
  fallback.util = "util";
  return options;
}

export default defineConfig({
  browser: "chrome",
  fixturesFolder: false,
  screenshotOnRunFailure: false,
  video: false,
  defaultCommandTimeout: 30000,
  e2e: {
    specPattern: "cypress/integration/**.test.ts",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setupNodeEvents(on: any) {
      on("file:preprocessor", webpackPreprocessor({ webpackOptions: getWebpackOptions() }));
    }
  }
});
