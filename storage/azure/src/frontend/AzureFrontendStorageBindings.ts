/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  FrontendStorage,
  FrontendStorageDependency,
  FrontendTypes
} from "@itwin/object-storage-core";

import {
  AzureFrontendStorage,
  BlockBlobClientWrapperFactory,
} from "../frontend";

export class AzureFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(container: Container): void {
    container
      .bind(FrontendTypes.clientWrapperFactory)
      .to(BlockBlobClientWrapperFactory)
      .inSingletonScope();
    container.bind(FrontendStorage).to(AzureFrontendStorage);
  }
}
