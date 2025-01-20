/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { DependencyConfig, DIContainer } from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
  Types,
} from "@itwin/object-storage-core";

import { Constants } from "../common";
import { BlockBlobClientWrapperFactory } from "../server/wrappers/BlockBlobClientWrapperFactory";

import { AzureClientStorage } from "./AzureClientStorage";

export class AzureClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    _config?: DependencyConfig
  ): void {
    container.registerFactory(
      Types.Client.clientWrapperFactory,
      () => new BlockBlobClientWrapperFactory()
    );
    container.registerFactory(
      ClientStorage,
      (c: DIContainer) =>
        new AzureClientStorage(c.resolve(Types.Client.clientWrapperFactory))
    );
  }
}
