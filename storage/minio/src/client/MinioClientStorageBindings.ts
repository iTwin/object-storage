/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { DIContainer } from "@itwin/cloud-agnostic-core";
import { ClientStorage, Types as CoreTypes } from "@itwin/object-storage-core";
import {
  S3ClientStorageBindings,
  S3ClientWrapperFactory,
} from "@itwin/object-storage-s3";

import { Constants } from "../common";

import { MinioClientStorage } from "./MinioClientStorage";

export class MinioClientStorageBindings extends S3ClientStorageBindings {
  public override readonly dependencyName: string = Constants.storageType;

  public override register(container: DIContainer): void {
    super.register(container);

    container.unregister<ClientStorage>(CoreTypes.Client.clientStorage);
    container.registerFactory<ClientStorage>(
      CoreTypes.Client.clientStorage,
      (c: DIContainer) => {
        return new MinioClientStorage(
          c.resolve<S3ClientWrapperFactory>(
            CoreTypes.Client.clientWrapperFactory
          )
        );
      }
    );
  }
}
