/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import {
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import { ServerStorageProxy } from "@itwin/object-storage-tests-frontend";

import { AzureServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

function run(): void {
  const backendServer = new ServerStorageProxy();

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
  backendServer.start({ port: 1221 });
}

run();
