/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { defineConfig } from "cypress"

export default defineConfig({
  browser: "chrome",
  fixturesFolder: false,
  screenshotOnRunFailure: false,
  video: false,
  defaultCommandTimeout: 30000,
  e2e: {
    specPattern: "cypress/integration/**.test.ts"
  }
});
