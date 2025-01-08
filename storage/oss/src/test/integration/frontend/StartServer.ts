/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import { ServerStorageProxy } from "@itwin/object-storage-tests-frontend";

import { OssServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

function run(): void {
  const backendServer = new ServerStorageProxy();

  backendServer.container.registerInstance<DependenciesConfig>(
    DependencyTypes.dependenciesConfig,
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ServerStorage: {
        dependencyName: "oss",
        ...new ServerStorageConfigProvider().get(),
      },
    }
  );
  backendServer.useBindings(OssServerStorageBindings);
  backendServer.start({ port: 1223 });
}

run();
