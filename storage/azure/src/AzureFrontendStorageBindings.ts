/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core";

import { BlockBlobClientWrapperFactory } from "./BlockBlobClientWrapperFactory";
import { AzureFrontendStorage } from "./frontend";

export class AzureFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(container: Container): void {
    container.bind(BlockBlobClientWrapperFactory).toSelf().inSingletonScope();
    container.bind(FrontendStorage).to(AzureFrontendStorage);
  }
}
