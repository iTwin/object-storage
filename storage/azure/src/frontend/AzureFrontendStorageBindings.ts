/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendStorage,
  FrontendStorageDependency,
  Types,
} from "@itwin/object-storage-core/lib/frontend";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import { Constants } from "../common";

import { AzureFrontendStorage } from "./AzureFrontendStorage";
import { FrontendBlockBlobClientWrapperFactory } from "./wrappers";

export class AzureFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(container: DIContainer): void {
    container.registerFactory<FrontendBlockBlobClientWrapperFactory>(
      Types.Frontend.clientWrapperFactory,
      () => new FrontendBlockBlobClientWrapperFactory()
    );
    container.registerFactory(FrontendStorage, (c: DIContainer) => {
      return new AzureFrontendStorage(
        c.resolve(Types.Frontend.clientWrapperFactory)
      );
    });
  }
}
