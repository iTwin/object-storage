/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BaseDirectory } from "@itwin/object-storage-core/lib/frontend";

import { FrontendServerStorageProxy } from "../../backend/server-storage-proxy/FrontendServerStorageProxy";

declare global {
  interface Crypto {
    randomUUID: () => `${string}-${string}-${string}-${string}-${string}`;
  }
}

export class FrontendTestRemoteDirectoryManager {
  private readonly _serverStorage: FrontendServerStorageProxy;
  private _createdDirectories: BaseDirectory[] = [];

  constructor(serverStorage: FrontendServerStorageProxy) {
    this._serverStorage = serverStorage;
  }

  public async createNew(): Promise<BaseDirectory> {
    const newDirectory: BaseDirectory = {
      baseDirectory: `integration-tests-${crypto.randomUUID()}`,
    };
    this.addForDelete(newDirectory);
    await this._serverStorage.createBaseDirectory({ directory: newDirectory });
    return newDirectory;
  }

  private addForDelete(directory: BaseDirectory): void {
    this._createdDirectories.push(directory);
  }

  public async purgeCreatedDirectories(): Promise<void> {
    for (const directoryToDelete of this._createdDirectories)
      await this._serverStorage.deleteBaseDirectory({
        directory: directoryToDelete,
      });
    this._createdDirectories = [];
  }
}
