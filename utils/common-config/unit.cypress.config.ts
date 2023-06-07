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
  e2e: {
    specPattern: "lib/test/unit/frontend/**.test.js",
    supportFile: false
  }
})