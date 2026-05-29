/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const fs = require("fs");
const https = require("https");
const constants = require("./MinioConstants");

function downloadFile(targetFilePath, executableDownloadLink) {
  return new Promise((resolve, reject) => {
    function get(url) {
      https
        .get(url, (response) => {
          if (
            response.statusCode === 301 ||
            response.statusCode === 302 ||
            response.statusCode === 307 ||
            response.statusCode === 308
          ) {
            const location = response.headers.location;
            response.resume();
            get(location);
            return;
          }
          if (response.statusCode !== 200) {
            response.resume();
            reject(
              new Error(
                `Download failed with status ${response.statusCode}: ${url}`,
              ),
            );
            return;
          }
          const destinationFile = fs.createWriteStream(targetFilePath);
          destinationFile.on("finish", resolve);
          destinationFile.on("error", reject);
          response.on("error", reject);
          response.pipe(destinationFile);
        })
        .on("error", reject);
    }
    get(executableDownloadLink);
  });
}

async function downloadMinioExecutable() {
  const { executableDownloadLink, targetFileDirectory, targetFilePath } =
    constants.resolveFileProperties();

  if (fs.existsSync(targetFilePath)) return;

  if (!fs.existsSync(targetFileDirectory))
    fs.mkdirSync(targetFileDirectory, { recursive: true });

  await downloadFile(targetFilePath, executableDownloadLink);

  if (process.platform === "linux") {
    // Mark the file as executable
    fs.chmodSync(targetFilePath, 0o755);
  }
}

downloadMinioExecutable().catch((error) => {
  console.error("Failed to download MinIO:", error.message);
  process.exit(1);
});
