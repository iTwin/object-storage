/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";

import {
  minioExecutablePath,
  minioServerCommand,
  minioStorageFolder,
  minioTestBucketName,
  resolveFileProperties,
} from "./MinioConstants";

function listenTo(readable: Readable, dataCallback: (data: unknown) => void) {
  if (readable) {
    readable.setEncoding("utf8");
    readable.on("data", dataCallback);
  }
}

function runMinio(): void {
  const testStorageDirectory = path.join(
    minioExecutablePath,
    minioStorageFolder
  );
  const testBucketFilePath = path.join(
    testStorageDirectory,
    minioTestBucketName
  );
  if (!fs.existsSync(testBucketFilePath))
    fs.mkdirSync(testBucketFilePath, { recursive: true });

  const { targetFilePath } = resolveFileProperties();
  const childProcess = child_process.spawn(targetFilePath, [
    minioServerCommand,
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
