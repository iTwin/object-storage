/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { UrlTransferClient } from "@itwin/object-storage-core/lib/server/internal";

import { DIContainer } from "@itwin/cloud-agnostic-core";
import { ClientStorage, Types as CoreTypes } from "@itwin/object-storage-core";
import {
  S3ClientStorageBindings,
  S3ClientStorageBindingsConfig,
  S3ClientWrapperFactory,
} from "@itwin/object-storage-s3";

import { Constants } from "../common";

import { MinioClientStorage } from "./MinioClientStorage";

export type MinioClientStorageBindingsConfig = S3ClientStorageBindingsConfig;

export class MinioClientStorageBindings extends S3ClientStorageBindings {
  public override readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config?: MinioClientStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.unregister<ClientStorage>(CoreTypes.Client.clientStorage);
    container.registerFactory<ClientStorage>(
      CoreTypes.Client.clientStorage,
      (c: DIContainer) =>
        new MinioClientStorage(
          c.resolve<S3ClientWrapperFactory>(
            CoreTypes.Client.clientWrapperFactory
          ),
          c.resolve(UrlTransferClient)
        )
    );
  }
}
