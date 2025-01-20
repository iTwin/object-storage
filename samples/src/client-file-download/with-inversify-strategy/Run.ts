/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import { AzureClientStorageBindings } from "@itwin/object-storage-azure";

import { App } from "./App";

/**
 * This function starts the application by first creating an instance of it and
 * then configuring its container by binding `DependenciesConfig` to a specific
 * value and `ClientStorage` to a specific implementation (in this case,
 * `StrategyClientStorage` class). `StrategyClientStorage` picks one of the
 * implementations specified through `useBindings` calls, based on the
 * `storageType` argument passed to its functions.
 */
async function run(): Promise<void> {
  const app = new App();

  app.container.registerInstance<DependenciesConfig>(
    DependencyTypes.dependenciesConfig,
    {
      ClientStorage: {
        bindingStrategy: "StrategyDependency",
        instance: {
          dependencyName: "",
        },
      },
    }
  );
  app.useBindings(AzureClientStorageBindings);

  return app.start();
}

run().catch((err) => console.error(err));
