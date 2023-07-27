/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  AzureClientStorage,
  BlobClientWrapperFactory,
  BlockBlobClientWrapperFactory,
  ContainerClientWrapperFactory,
} from "@itwin/object-storage-azure";

import { App } from "./App";

/**
 * This function starts the application by creating an instance of
 * `AzureClientStorage` which is passed to `App` constructor.
 */
async function run(): Promise<void> {
  const blobClientWrapperFactory = new BlobClientWrapperFactory();
  const blockBlobClientWrapperFactory = new BlockBlobClientWrapperFactory();
  const containerClientWrapperFactory = new ContainerClientWrapperFactory();
  const clientStorage = new AzureClientStorage(
    blobClientWrapperFactory,
    blockBlobClientWrapperFactory,
    containerClientWrapperFactory
  );
  const app = new App(clientStorage);
  return app.start();
}

run().catch((err) => console.error(err));
