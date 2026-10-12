/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const path = require("path");

// SeaweedFS (Apache-2.0) is a local S3-compatible server with STS AssumeRole
// and session policy support, used to integration test the S3 package.
const seaweedFSVersion = "4.48";
const releaseUrl = `https://github.com/seaweedfs/seaweedfs/releases/download/${seaweedFSVersion}`;

const seaweedFSRootDirectory = path.join(process.cwd(), "lib", "test", "SeaweedFS");
const seaweedFSBinaryDirectory = path.join(seaweedFSRootDirectory, seaweedFSVersion);
const seaweedFSDataDirectory = path.join(seaweedFSRootDirectory, "data");
const seaweedFSConfigDirectory = path.join(seaweedFSRootDirectory, "config");

const host = "127.0.0.1";
const s3Port = 8333;
const region = "us-east-1";
// cspell:disable-next-line
const accessKey = "integrationtestaccesskey";
// cspell:disable-next-line
const secretKey = "integrationtestsecretkey";
const identityName = "integration-test-user";
const roleName = "integration-test-role";
const roleArn = `arn:aws:iam::role/${roleName}`;
const bucketNames = ["integration-test", "integration-test-2"];
// Origin of the page served by frontend/StartServer.ts that the browser tests run in.
const frontendTestOrigin = "http://localhost:1225";

function resolveReleaseAsset() {
  switch (process.platform) {
    case "win32":
      return {
        archiveName: "windows_amd64.zip",
        archiveSha256:
          "fe90c04c0620ad1a1c756f86cd5e1443773f56a446688077a4bb5ec04c3cc874",
        executablePath: path.join(seaweedFSBinaryDirectory, "weed.exe"),
      };
    case "linux":
      return {
        archiveName: "linux_amd64.tar.gz",
        archiveSha256:
          "4a7d108384d044d95212d1342cdda9533fa55842c1c9b41f606ca3c8a9561124",
        executablePath: path.join(seaweedFSBinaryDirectory, "weed"),
      };
    default:
      throw new Error(
        `Unsupported OS for SeaweedFS download: ${process.platform}`
      );
  }
}

module.exports = {
  accessKey,
  bucketNames,
  frontendTestOrigin,
  host,
  identityName,
  region,
  releaseUrl,
  resolveReleaseAsset,
  roleArn,
  roleName,
  s3Port,
  seaweedFSBinaryDirectory,
  seaweedFSConfigDirectory,
  seaweedFSDataDirectory,
  secretKey,
};
