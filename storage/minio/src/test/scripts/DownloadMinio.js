/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const fs = require("fs");
const https = require("https");
const constants = require("./MinioConstants");

function downloadFile(targetFilePath, executableDownloadLink) {
  return new Promise((resolve) => {
    const destinationFile = fs.createWriteStream(targetFilePath);
    destinationFile.on('finish', () => {
      resolve();
    });

    https.get(executableDownloadLink, (response) => {
      response.pipe(destinationFile);
    });
  });
}

async function downloadMinioExecutable() {
  const { executableDownloadLink, targetFileDirectory, targetFilePath } =
    constants.resolveFileProperties();

  if (fs.existsSync(targetFilePath))
    return;

  if (!fs.existsSync(targetFileDirectory))
    fs.mkdirSync(targetFileDirectory, { recursive: true });

  await downloadFile(targetFilePath, executableDownloadLink);

  if (process.platform === "linux") {
    // Mark the file as executable
    fs.chmodSync(targetFilePath, 0o755);
  }
}

downloadMinioExecutable();
