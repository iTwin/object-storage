/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { existsSync, constants as fsConstants, promises } from "fs";
import * as path from "path";

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
    content?: Buffer
  ): Promise<string> {
    if (!existsSync(this._uploadsDir))
      await promises.mkdir(this._uploadsDir, { recursive: true });

    const filePath = path.join(this._uploadsDir, fileName);
    await promises.writeFile(filePath, content ?? "");
    return filePath;
  }

  public async purgeCreatedFiles(): Promise<void> {
    await Promise.all([
      this.purgeDirectory(this._downloadsDir),
      this.purgeDirectory(this._uploadsDir),
    ]);
  }

  // TODO: switch to using fs.promises.rm function once support for Node 12.x is dropped.
  private async purgeDirectory(directory: string): Promise<void> {
    if (!(await this.doesFileOrDirectoryExist(directory))) return;

    const directoryItems = await promises.readdir(directory);
    for (const itemName of directoryItems) {
      const fullItemPath = path.join(directory, itemName);
      if (await this.doesFileOrDirectoryExist(fullItemPath))
        await promises.unlink(fullItemPath);
    }
  }

  private async doesFileOrDirectoryExist(
    fileOrDirPath: string
  ): Promise<boolean> {
    try {
      await promises.access(fileOrDirPath, fsConstants.F_OK);
      return true;
    } catch (error: unknown) {
      return false;
    }
  }
}
