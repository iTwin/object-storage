/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const path = require("path");
const child_process = require("child_process");
const { directOutputToConsole } = require(path.join(
  "..",
  "..",
  "utils",
  "common-config",
  "scripts",
  "Common.js"
));

function runPnpmAuditAsync() {
  const rushCommonDir = path.join(__dirname, "..", "..", "common");
  const pnpmBinaryPath = path.join(rushCommonDir, "temp", "pnpm-local", "node_modules", ".bin", "pnpm");
  const pnpmLockFileDir = path.join(rushCommonDir, "config", "rush");

  const childProcess = child_process.spawn(
    pnpmBinaryPath,
    [
      "audit",
      "--registry=https://registry.npmjs.org/",
      "--audit-level=high",
      "--production"
    ],
    {
      cwd: pnpmLockFileDir,
      shell: true
    }
  );

  childProcess.on('exit', (code) => {
    process.exitCode = code;
  });
  directOutputToConsole(childProcess);
}

runPnpmAuditAsync();