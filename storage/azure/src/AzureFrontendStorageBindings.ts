/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core";

import { AzureFrontendStorage } from "./frontend";
import { CommonBindings } from "./CommonBindings";

export class AzureFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(container: Container): void {
    CommonBindings.register(container);
    container.bind(FrontendStorage).to(AzureFrontendStorage);
  }
}
