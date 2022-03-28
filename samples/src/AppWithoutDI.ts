/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { AzureClientStorage } from "@itwin/object-storage-azure";
import { ClientStorage } from "@itwin/object-storage-core";

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

export class App {
  public async start(): Promise<void> {
    const azureClientStorage = new AzureClientStorage();
    const fileDownloader = new FileDownloader(azureClientStorage);
    await fileDownloader.downloadFile();
  }
}

const app = new App();
// eslint-disable-next-line no-console
app.start().catch((err) => console.error(err));
