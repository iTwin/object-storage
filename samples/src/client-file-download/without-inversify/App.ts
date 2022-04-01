/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientStorage } from "@itwin/object-storage-core";

import { FileDownloader } from "../FileDownloader";

/**
 * This class is an example of a minimal application that depends on generic
 * `ClientStorage` class. It is not aware of any implementations which are
 * configured at runtime (see Run.ts file in this directory). This application
 * is not dependent on any specific dependency injection framework.
 */
export class App {
  public constructor(private _clientStorage: ClientStorage) {}

  public async start(): Promise<void> {
    const fileDownloader = new FileDownloader(this._clientStorage);
    await fileDownloader.downloadFile();
  }
}
