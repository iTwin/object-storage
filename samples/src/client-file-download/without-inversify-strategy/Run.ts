/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { StrategyInstance } from "@itwin/cloud-agnostic-core";
import {
  AzureClientStorage,
  BlockBlobClientWrapperFactory,
} from "@itwin/object-storage-azure";
import { StrategyClientStorage } from "@itwin/object-storage-core";

import { App } from "./App";

/**
 * This function starts the application by creating an instance of
 * `StrategyClientStorage` which is passed to `App` constructor. It
 * can switch between different implementations of `ClientStorage`
 * that are passed to its constructor.
 */
async function run(): Promise<void> {
  const blobClientWrapperFactory = new BlockBlobClientWrapperFactory();
  const clientStorage = new StrategyClientStorage([
    new StrategyInstance(
      new AzureClientStorage(blobClientWrapperFactory),
      "azure"
    ),
  ]);
  const app = new App(clientStorage);
  return app.start();
}

run().catch((err) => console.error(err));
