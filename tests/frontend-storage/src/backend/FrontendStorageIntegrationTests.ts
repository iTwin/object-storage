/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as fs from "fs";
import * as path from "path";

import * as cypress from "cypress";

export class FrontendStorageIntegrationTests {
  constructor(
    private readonly _supportFileSourcePath: string,
    private readonly _envVariables?: object
  ) {}

  public async start(): Promise<void> {
    const projectPath = path.resolve(__dirname, "..");
    const configPath = path.resolve(
      projectPath,
      "node_modules/@itwin/object-storage-common-config/integration.cypress.config.ts"
    );

    const supportDir = path.resolve(projectPath, "cypress", "support");
    if (!fs.existsSync(supportDir))
      fs.mkdirSync(supportDir, { recursive: true });

    const supportFileName = path.basename(this._supportFileSourcePath);
    const supportFileTargetPath = path.join(supportDir, supportFileName);
    fs.copyFileSync(this._supportFileSourcePath, supportFileTargetPath);

    const cypressConfig: Partial<CypressCommandLine.CypressOpenOptions> = {
      project: projectPath,
      configFile: configPath,
      config: {
        e2e: {
          supportFile: supportFileTargetPath,
        },
        env: this._envVariables,
      },
    };

    if (process.env.DEBUG) await cypress.open(cypressConfig);
    else {
      const result = await cypress.run(cypressConfig);
      if (this.didCypressLaunchFail(result) || this.didCypressTestsFail(result))
        throw new Error("Test run failed.");
    }
  }

  private didCypressLaunchFail(result: CypressCommandLine.CypressFailedRunResult | CypressCommandLine.CypressRunResult): boolean {
    return "status" in result && result.status === "failed";
  }

  private didCypressTestsFail(result: CypressCommandLine.CypressFailedRunResult | CypressCommandLine.CypressRunResult): boolean {
    return "totalFailed" in result && result.totalFailed > 0;
  }
}
