/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  frontendBindingTag,
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core/lib/frontend";

import {
  AzureFrontendStorage,
  BlockBlobClientWrapperFactory,
} from "../frontend";

export class AzureFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(container: Container): void {
    container
      .bind(BlockBlobClientWrapperFactory)
      .toSelf()
      .inSingletonScope()
      .whenTargetNamed(frontendBindingTag);
    container.bind(FrontendStorage).to(AzureFrontendStorage);
  }
}
