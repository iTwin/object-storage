/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  AzureClientStorage,
  BlockBlobClientWrapperFactory,
} from "@itwin/object-storage-azure";

import { App } from "./App";

/**
 * This function starts the application by creating an instance of
 * `AzureClientStorage` which is passed to `App` constructor.
 */
async function run(): Promise<void> {
  const blobClientWrapperFactory = new BlockBlobClientWrapperFactory();
  const clientStorage = new AzureClientStorage(blobClientWrapperFactory);
  const app = new App(clientStorage);
  return app.start();
}

run().catch((err) => console.error(err));
