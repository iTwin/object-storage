/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { inject, injectable, named } from "inversify";

import { ClientStorage } from "@itwin/object-storage-core";

/**
 * Simple file downloader that depends on two different {@link ClientStorage} instances. Any specific
 * implementation of {@link ClientStorage} can be passed to the constructor
 * making this class cloud agnostic. {@link ClientStorage} instances are resolved
 * using instance name (which is described in the configuration as instanceName property)
 */
@injectable()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class NamedFileDownloader {
  constructor(
    @inject(ClientStorage)
    @named("instanceName1")
    private _storage1: ClientStorage,
    @inject(ClientStorage)
    @named("instanceName2")
    private _storage2: ClientStorage
  ) {}

  public async downloadAllFiles(): Promise<void> {
    await this._storage1.download({
      transferType: "local",
      url: "FILE_URL_PLACEHOLDER",
      localPath: "downloadedFile.txt",
    });

    await this._storage2.download({
      transferType: "local",
      url: "FILE_URL_PLACEHOLDER",
      localPath: "downloadedFile.txt",
    });
  }
}
