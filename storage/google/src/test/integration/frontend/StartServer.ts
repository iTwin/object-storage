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

import { GoogleServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

function run(): void {
  const backendServer = new ServerStorageProxy();

  backendServer.container.registerInstance<DependenciesConfig>(
    DependencyTypes.dependenciesConfig,
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ServerStorage: {
        dependencyName: "google",
        ...new ServerStorageConfigProvider().get(),
      },
    }
  );
  backendServer.useBindings(GoogleServerStorageBindings);
  backendServer.start({ port: 1224 });
}

run();
