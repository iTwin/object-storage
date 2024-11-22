/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core/lib/frontend";

import { GoogleFrontendStorage } from "./GoogleFrontendStorage";

export class GoogleFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = "google";

  public override register(container: Container): void {
    container
      .bind(FrontendStorage)
      .to(GoogleFrontendStorage)
      .inSingletonScope();
  }
}
