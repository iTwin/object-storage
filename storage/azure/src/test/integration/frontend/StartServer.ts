/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import { ServerStorageProxyBackend } from "@itwin/object-storage-tests-frontend";

import { AzureServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

async function run(): Promise<void> {
  const backendServer = new ServerStorageProxyBackend();

  backendServer.container
    .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
    .toConstantValue({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ServerStorage: {
        dependencyName: "azure",
        ...new ServerStorageConfigProvider().get(),
      },
    });
  backendServer.useBindings(AzureServerStorageBindings);
  return backendServer.start({ port: 1221 });
}

// eslint-disable-next-line
run().catch((err) => console.error(err));
