/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  Types as CoreTypes,
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core/lib/frontend";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import { Constants } from "../common";

import { S3FrontendStorage } from "./S3FrontendStorage";
import { FrontendS3ClientWrapperFactory } from "./wrappers";

export class S3FrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(container: DIContainer): void {
    container.registerFactory(
      CoreTypes.Frontend.clientWrapperFactory,
      () => new FrontendS3ClientWrapperFactory()
    );
    container.registerFactory<FrontendStorage>(
      CoreTypes.Frontend.frontendStorage,
      (c: DIContainer) =>
        new S3FrontendStorage(
          c.resolve(CoreTypes.Frontend.clientWrapperFactory)
        )
    );
  }
}
