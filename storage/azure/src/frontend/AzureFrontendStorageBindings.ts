/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Types } from "@itwin/object-storage-core/lib/common";
import {
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core/lib/frontend";

import { AzureFrontendStorage } from "./AzureFrontendStorage";
import { FrontendBlockBlobClientWrapperFactory } from "./FrontendBlockBlobClientWrapperFactory";

export class AzureFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(container: Container): void {
    container
      .bind(Types.Frontend.clientWrapperFactory)
      .to(FrontendBlockBlobClientWrapperFactory)
      .inSingletonScope();
    container.bind(FrontendStorage).to(AzureFrontendStorage).inSingletonScope();
  }
}
