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
  const app = new App(
    new AzureClientStorage(new BlockBlobClientWrapperFactory())
  );
  return app.start();
}

run().catch((err) => console.error(err));
