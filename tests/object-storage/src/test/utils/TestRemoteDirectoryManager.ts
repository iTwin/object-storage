/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BaseDirectory } from "@itwin/object-storage-core";
import { randomUUID } from "crypto";
import { config } from "../Config";
import { TestRemoteDirectory } from "./TestRemoteDirectory";

const { serverStorage } = config;

export class TestRemoteDirectoryManager {
  private _createdDirectories: BaseDirectory[] = [];

  public async createNew(): Promise<TestRemoteDirectory> {
    const newDirectory: BaseDirectory = {
      baseDirectory: `integration-tests-${randomUUID()}`,
    };
    this.addForDelete(newDirectory);
    await serverStorage.createBaseDirectory(newDirectory);
    return new TestRemoteDirectory(newDirectory);
  }

  public addForDelete(directory: BaseDirectory): void {
    this._createdDirectories.push(directory);
  }

  public async purgeCreatedDirectories(): Promise<void> {
    for (const directoryToDelete of this._createdDirectories)
      await serverStorage.deleteBaseDirectory(directoryToDelete);
    this._createdDirectories = [];
  }
}