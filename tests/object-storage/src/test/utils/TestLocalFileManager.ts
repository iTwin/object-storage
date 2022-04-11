/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { existsSync, promises, rmSync } from "fs";
import path = require("path");

export class TestLocalFileManager {
  private readonly _downloadsDir: string;
  private readonly _uploadsDir: string;

  constructor(rootDir: string) {
    this._downloadsDir = path.join(rootDir, "downloads");
    this._uploadsDir = path.join(rootDir, "uploads");
  }

  public async getDownloadsDir(): Promise<string> {
    if (!existsSync(this._downloadsDir))
      await promises.mkdir(this._downloadsDir, { recursive: true });

    return this._downloadsDir;
  }

  public async createAndWriteFile(
    fileName: string,
    content: Buffer
  ): Promise<string> {
    if (!existsSync(this._uploadsDir))
      await promises.mkdir(this._uploadsDir, { recursive: true });

    const filePath = path.join(this._uploadsDir, fileName);
    await promises.writeFile(filePath, content);
    return filePath;
  }

  public async purgeCreatedFiles(): Promise<void> {
    this.purgeDirectory(this._downloadsDir);
    this.purgeDirectory(this._uploadsDir);
  }

  private purgeDirectory(directory: string): void {
    rmSync(directory, { recursive: true, force: true });
  }
}