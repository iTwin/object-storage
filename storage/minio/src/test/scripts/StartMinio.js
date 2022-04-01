/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const constants = require("./MinioConstants");

function listenTo(readable, dataCallback) {
  if (readable) {
    readable.setEncoding("utf8");
    readable.on("data", dataCallback);
  }
}

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
  if (childProcess.stdout)
    listenTo(childProcess.stdout, (data) => {
      // eslint-disable-next-line no-console
      console.log(data);
    });
  if (childProcess.stderr)
    listenTo(childProcess.stderr, (data) => {
      // eslint-disable-next-line no-console
      console.error(data);
    });
}

runMinio();
