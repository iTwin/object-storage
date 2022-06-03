/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import { ServerStorageProxyBackend } from "@itwin/object-storage-tests-frontend";

import { MinioServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

async function run(): Promise<void> {
  const backendServer = new ServerStorageProxyBackend();

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
  return backendServer.start({ port: 1222 });
}

// eslint-disable-next-line
run().catch((err) => console.error(err));
