/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";

export class MinioProcess {
  private readonly _minioExecutableDirectory = path.join(
    process.cwd(),
    "lib",
    "test"
  );
  private readonly _minioExecutablePath = path.join(
    this._minioExecutableDirectory,
    process.platform === "win32" ? "minio.exe" : "minio"
  );
  private readonly _minioServerArgument = "server";
  private readonly _minioStoragePath = path.join(
    this._minioExecutableDirectory,
    "minioStorage"
  );
  private readonly _childProcessTimeoutMs = 5 * 60 * 1000;

  private _childProcess: child_process.ChildProcess | undefined;

  public async start(bucketName: string): Promise<void> {
    const testBucketPath = path.join(this._minioStoragePath, bucketName);
    if (!fs.existsSync(testBucketPath))
      fs.mkdirSync(testBucketPath, { recursive: true });

    this._childProcess = child_process.spawn(
      this._minioExecutablePath,
      [this._minioServerArgument, this._minioStoragePath],
      {
        timeout: this._childProcessTimeoutMs,
      }
    );
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
