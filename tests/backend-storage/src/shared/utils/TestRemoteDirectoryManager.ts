/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { getRandomString } from "@itwin/object-storage-core/lib/server/internal";

import { BaseDirectory, ServerStorage } from "@itwin/object-storage-core";

import { TestRemoteDirectory } from "./TestRemoteDirectory";

export class TestRemoteDirectoryManager {
  private _createdDirectories: BaseDirectory[] = [];

  public constructor(private _serverStorage: ServerStorage) {}

  public async createNew(): Promise<TestRemoteDirectory> {
    const newDirectory: BaseDirectory = {
      baseDirectory: `integration-tests-${getRandomString()}`,
    };
    this.addForDelete(newDirectory);
    await this._serverStorage.createBaseDirectory(newDirectory);
    return new TestRemoteDirectory(newDirectory);
  }

  public addForDelete(directory: BaseDirectory): void {
    this._createdDirectories.push(directory);
  }

  public async purgeCreatedDirectories(): Promise<void> {
    for (const directoryToDelete of this._createdDirectories)
      await this._serverStorage.deleteBaseDirectory(directoryToDelete);
    this._createdDirectories = [];
  }
}
