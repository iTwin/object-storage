/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as fs from "fs";
import * as path from "path";

import * as cypress from "cypress";

export class FrontendStorageIntegrationTests {
  constructor(private readonly _supportFileSourcePath: string) {}

  public async start(): Promise<void> {
    const supportDir = path.resolve(__dirname, "..", "cypress", "support");
    if (!fs.existsSync(supportDir))
      fs.mkdirSync(supportDir, { recursive: true });

    const supportFileName = path.basename(this._supportFileSourcePath);
    const supportFileTargetPath = path.join(supportDir, supportFileName);
    fs.copyFileSync(this._supportFileSourcePath, supportFileTargetPath);

    const currentProjectRootAbsolutePath = path.resolve(__dirname, "..");
    await cypress.run({
      browser: "chrome",
      project: currentProjectRootAbsolutePath,
      configFile: false,
      config: {
        video: false,
        screenshotOnRunFailure: false,
        supportFile: supportFileTargetPath,
        pluginsFile: false,
        fixturesFolder: false,
        defaultCommandTimeout: 30000,
      },
    });
  }
}
