/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { injectable } from "inversify";

import { ClientStorage } from "@itwin/object-storage-core";

/**
 * Simple file downloader that depends on {@link ClientStorage}. Any specific
 * implementation of {@link ClientStorage} can be passed to the constructor
 * making this class cloud agnostic.
 */
@injectable()
export class FileDownloader {
  constructor(private _storage: ClientStorage) {}

  public async downloadFile(): Promise<void> {
    await this._storage.download({
      transferType: "local",
      url: "FILE_URL_PLACEHOLDER",
      localPath: "downloadedFile.txt",
    });
  }
}
