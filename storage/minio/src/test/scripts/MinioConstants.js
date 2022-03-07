/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
const path = require("path");

const minioExecutableLinkWindows =
  "https://dl.min.io/server/minio/release/windows-amd64/minio.exe";
const minioExecutableLinkLinux =
  "https://dl.min.io/server/minio/release/linux-amd64/minio";

const minioExecutablePath = path.join(process.cwd(), "lib", "test");
const minioExecutablePathWindows = path.join(minioExecutablePath, "minio.exe");
const minioExecutablePathLinux = path.join(minioExecutablePath, "minio");
const minioServerCommand = "server";
const minioStorageFolder = "storage";
const minioTestBucketName = "integration-test";

function resolveFileProperties() {
  switch (process.platform) {
    case "win32":
      return {
        executableDownloadLink: minioExecutableLinkWindows,
        targetFilePath: minioExecutablePathWindows,
      };
    case "linux":
      return {
        executableDownloadLink: minioExecutableLinkLinux,
        targetFilePath: minioExecutablePathLinux,
      };
    default:
      throw new Error(`Unsupported OS for MinIO download: ${process.env}`);
  }
}

module.exports = { minioExecutablePath, minioServerCommand, minioStorageFolder, minioTestBucketName, resolveFileProperties };
