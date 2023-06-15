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

import { MinioServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

function run(): void {
  const backendServer = new ServerStorageProxy();

  backendServer.container
    .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
    .toConstantValue({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ServerStorage: {
        dependencyName: "minio",
        ...new ServerStorageConfigProvider().get(),
      },
    });
  backendServer.useBindings(MinioServerStorageBindings);
  backendServer.start({ port: 1222 });
}

run();
