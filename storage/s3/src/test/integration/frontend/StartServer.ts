/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  DependenciesConfig,
  Types as DependencyTypes,
  TypedDependencyConfig,
} from "@itwin/cloud-agnostic-core";
import { ServerStorageProxy } from "@itwin/object-storage-tests-frontend";

import { Constants } from "../../../common";
import { S3ServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

function run(): void {
  const backendServer = new ServerStorageProxy();

  backendServer.container.registerInstance<DependenciesConfig>(
    DependencyTypes.dependenciesConfig,
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ServerStorage: {
        bindingStrategy: "Dependency",
        instance: {
          dependencyName: Constants.storageType,
          ...new ServerStorageConfigProvider().get(),
        },
      } as TypedDependencyConfig,
    }
  );
  backendServer.useBindings(S3ServerStorageBindings);
  backendServer.start({ port: 1225 });
}

run();
