/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendStorage,
  FrontendStorageDependency,
  Types as CoreTypes,
} from "@itwin/object-storage-core/lib/frontend";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import { Constants } from "../common";

import { AzureFrontendStorage } from "./AzureFrontendStorage";
import { FrontendBlockBlobClientWrapperFactory } from "./wrappers";

export class AzureFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(container: DIContainer): void {
    container.registerFactory<FrontendBlockBlobClientWrapperFactory>(
      CoreTypes.Frontend.clientWrapperFactory,
      () => new FrontendBlockBlobClientWrapperFactory()
    );
    container.registerFactory<FrontendStorage>(
      CoreTypes.Frontend.frontendStorage,
      (c: DIContainer) => {
        return new AzureFrontendStorage(
          c.resolve(CoreTypes.Frontend.clientWrapperFactory)
        );
      }
    );
  }
}
