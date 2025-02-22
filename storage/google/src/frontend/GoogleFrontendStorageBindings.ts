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

import { GoogleFrontendStorage } from "./GoogleFrontendStorage";

export class GoogleFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(container: DIContainer): void {
    container.registerFactory<FrontendStorage>(
      CoreTypes.Frontend.frontendStorage,
      () => new GoogleFrontendStorage()
    );
  }
}
