/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import { BackendStorageServer } from "@itwin/object-storage-tests-frontend";

import { AzureServerStorageBindings } from "../../server";

import { TestAzureServerStorageConfig } from "./TestAzureServerStorageConfig";

async function run(): Promise<void> {
  const backendServer = new BackendStorageServer();

  backendServer.container
    .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
    .toConstantValue({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ServerStorage: {
        dependencyName: "azure",
        ...new TestAzureServerStorageConfig().get(),
      },
    });
  backendServer.useBindings(AzureServerStorageBindings);
  return backendServer.start();
}

// eslint-disable-next-line
run().catch((err) => console.error(err));
