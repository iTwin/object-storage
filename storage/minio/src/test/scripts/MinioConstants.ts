/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import * as path from "path";

const minioExecutableLinkWindows =
  "https://dl.min.io/server/minio/release/windows-amd64/minio.exe";
const minioExecutableLinkLinux =
  "https://dl.min.io/server/minio/release/linux-amd64/minio";

export const minioExecutablePath = path.join(process.cwd(), "lib", "test");
const minioExecutablePathWindows = path.join(minioExecutablePath, "minio.exe");
const minioExecutablePathLinux = path.join(minioExecutablePath, "minio");
export const minioServerCommand = "server";
export const minioStorageFolder = "storage";
export const minioTestBucketName = "integration-test";

export function resolveFileProperties(): {
  executableDownloadLink: string;
  targetFilePath: string;
} {
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
