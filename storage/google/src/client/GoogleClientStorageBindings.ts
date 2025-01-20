/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { DIContainer } from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
} from "@itwin/object-storage-core";

import { Constants } from "../common";

import { GoogleClientStorage } from "./GoogleClientStorage";
import { ClientStorageWrapperFactory } from "./wrappers";

export class GoogleClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(container: DIContainer): void {
    container.registerFactory(
      ClientStorageWrapperFactory,
      () => new ClientStorageWrapperFactory()
    );
    container.registerFactory(
      ClientStorage,
      (c: DIContainer) =>
        new GoogleClientStorage(c.resolve(ClientStorageWrapperFactory))
    );
  }
}
