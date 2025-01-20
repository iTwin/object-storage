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
 * `AzureClientStorage` class).This allows the `App` class to be unaware of any
 * specific cloud providers and rely that it will get some type of
 * `ClientStorage`.
 */
async function run(): Promise<void> {
  const app = new App();

  app.container.registerInstance<DependenciesConfig>(
    DependencyTypes.dependenciesConfig,
    {
      ClientStorage: {
        bindingStrategy: "NamedDependency",
        instances: [
          {
            instanceName: "instanceName1",
            dependencyName: "azure",
          },
          {
            instanceName: "instanceName2",
            dependencyName: "azure",
          },
        ],
      },
    }
  );
  app.useBindings(AzureClientStorageBindings);

  return app.start();
}

run().catch((err) => console.error(err));
