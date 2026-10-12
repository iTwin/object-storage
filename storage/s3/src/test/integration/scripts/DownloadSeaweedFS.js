/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const child_process = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const path = require("path");
const constants = require("./SeaweedFSConstants");

const maxRedirects = 5;

function downloadFile(url, targetFilePath, redirectsLeft = maxRedirects) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const { statusCode, headers } = response;
        if (
          [301, 302, 303, 307, 308].includes(statusCode) &&
          headers.location
        ) {
          response.resume();
          if (redirectsLeft === 0) {
            reject(new Error(`Too many redirects: ${url}`));
            return;
          }
          const location = new URL(headers.location, url);
          if (location.protocol !== "https:") {
            reject(new Error(`Refusing non-HTTPS redirect: ${location}`));
            return;
          }
          downloadFile(location.toString(), targetFilePath, redirectsLeft - 1)
            .then(resolve)
            .catch(reject);
          return;
        }
        if (statusCode !== 200) {
          response.resume();
          reject(new Error(`Download failed with status ${statusCode}: ${url}`));
          return;
        }
        const destinationFile = fs.createWriteStream(targetFilePath);
        destinationFile.on("finish", resolve);
        destinationFile.on("error", reject);
        response.on("error", reject);
        response.pipe(destinationFile);
      })
      .on("error", reject);
  });
}

function computeSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    fs.createReadStream(filePath)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", reject);
  });
}

function extractArchive(archivePath, targetDirectory) {
  // Windows ships with tar, which extracts zip archives. Use it explicitly so
  // that GNU tar from Git for Windows, which cannot, is not picked up instead.
  const tarExecutable =
    process.platform === "win32"
      ? path.join(process.env.SystemRoot, "System32", "tar.exe")
      : "tar";
  const result = child_process.spawnSync(
    tarExecutable,
    ["-xf", archivePath, "-C", targetDirectory],
    { stdio: "inherit" }
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`Extracting ${archivePath} failed (${result.status}).`);
}

async function downloadSeaweedFS() {
  const { archiveName, archiveSha256, executablePath } =
    constants.resolveReleaseAsset();

  if (fs.existsSync(executablePath)) return;

  fs.mkdirSync(constants.seaweedFSBinaryDirectory, { recursive: true });
  const archivePath = path.join(constants.seaweedFSBinaryDirectory, archiveName);

  await downloadFile(`${constants.releaseUrl}/${archiveName}`, archivePath);

  const actualSha256 = await computeSha256(archivePath);
  if (actualSha256 !== archiveSha256) {
    fs.rmSync(archivePath, { force: true });
    throw new Error(
      `SHA-256 mismatch for ${archiveName}: expected ${archiveSha256}, got ${actualSha256}.`
    );
  }

  extractArchive(archivePath, constants.seaweedFSBinaryDirectory);
  fs.rmSync(archivePath, { force: true });

  if (!fs.existsSync(executablePath))
    throw new Error(`${executablePath} not found in ${archiveName}.`);
  if (process.platform !== "win32") fs.chmodSync(executablePath, 0o755);
}

downloadSeaweedFS().catch((error) => {
  console.error("Failed to download SeaweedFS:", error.message);
  process.exit(1);
});
