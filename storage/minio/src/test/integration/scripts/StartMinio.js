/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const constants = require("./MinioConstants");
const { directOutputToConsole } = require(path.join(
  "..",
  "..",
  "..",
  "node_modules",
  "@itwin",
  "object-storage-common-config",
  "scripts",
  "Common.js"
));

function runMinio() {
  const testStorageDirectory = path.join(
    constants.minioExecutablePath,
    constants.minioStorageFolder
  );
  const testBucketFilePath = path.join(
    testStorageDirectory,
    constants.minioTestBucketName
  );
  if (!fs.existsSync(testBucketFilePath))
    fs.mkdirSync(testBucketFilePath, { recursive: true });

  const { targetFilePath } = constants.resolveFileProperties();
  const childProcess = child_process.spawn(targetFilePath, [
    constants.minioServerCommand,
    testStorageDirectory,
  ]);

  directOutputToConsole(childProcess);
}

runMinio();
