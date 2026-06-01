/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  FrontendStorage,
  FrontendStorageBindingsConfig,
  FrontendStorageDependency,
  Types as CoreTypes,
} from "@itwin/object-storage-core/lib/frontend";
import { FrontendUrlTransferClient } from "@itwin/object-storage-core/lib/frontend/internal";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import { Constants, Types } from "../common";

import { GoogleFrontendStorage } from "./GoogleFrontendStorage";

export class GoogleFrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config?: FrontendStorageBindingsConfig
  ): void {
    container.registerInstance<FrontendStorageBindingsConfig>(
      Types.GoogleFrontend.config,
      config ?? { dependencyName: Constants.storageType }
    );
    container.registerFactory<FrontendUrlTransferClient>(
      CoreTypes.Frontend.urlTransferClient,
      (c: DIContainer) =>
        new FrontendUrlTransferClient(
          c.resolve<FrontendStorageBindingsConfig>(
            Types.GoogleFrontend.config
          ).retryOptions
        )
    );
    container.registerFactory<FrontendStorage>(
      CoreTypes.Frontend.frontendStorage,
      (c: DIContainer) =>
        new GoogleFrontendStorage(
          c.resolve(CoreTypes.Frontend.urlTransferClient)
        )
    );
  }
}
