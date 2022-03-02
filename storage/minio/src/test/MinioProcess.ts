/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { ChildProcess, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";

export class MinioProcess {
  private _childProcess: ChildProcess | undefined;

  public async start(bucketName: string): Promise<void> {
    const minioFilePath = path.join(process.cwd(), "lib", "test");
    const minioStoragePath = path.join(minioFilePath, "miniostorage");
    const testBucketPath = path.join(minioStoragePath, bucketName);
    if (!fs.existsSync(testBucketPath))
      fs.mkdirSync(testBucketPath, { recursive: true });

    const windowsCommand = path.join(minioFilePath, "minio.exe");

    this._childProcess = spawn(windowsCommand, ["server", minioStoragePath], {
      timeout: 5 * 60 * 1000,
    });
    if (this._childProcess.stdout)
      this.listenTo(this._childProcess.stdout, (data) => {
        // eslint-disable-next-line no-console
        console.log(data);
      });
    if (this._childProcess.stderr)
      this.listenTo(this._childProcess.stderr, (data) => {
        // eslint-disable-next-line no-console
        console.error(data);
      });

    // There is a short delay until MinIO port becomes accessible after command
    // executes.
    await this.sleep(3 * 1000);
  }

  public terminate(): void {
    this._childProcess?.kill();
  }

  private listenTo(readable: Readable, dataCallback: (data: string) => void) {
    if (readable) {
      readable.setEncoding("utf8");
      readable.on("data", dataCallback);
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
