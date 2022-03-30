/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { AzureClientStorage } from "@itwin/object-storage-azure";
import { ClientStorage } from "@itwin/object-storage-core";

/**
 * Simple file downloader that depends on {@link ClientStorage}. Any specific
 * implementation of {@link ClientStorage} can be passed to the constructor
 * making this class cloud agnostic.
 */
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

/**
 * This minimal application demonstrates how storage components can be used and
 * managed without `inversify`.
 */
export class App {
  private _fileDownloader: FileDownloader;

  public constructor(storage: ClientStorage) { 
    this._fileDownloader = new FileDownloader(storage);
  }
  
  public async start(): Promise<void> {
    await this._fileDownloader.downloadFile();
  }
}

const app = new App(new AzureClientStorage());
app.start().catch((err) => console.error(err));
