/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { DIContainer } from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
  Types as CoreTypes,
} from "@itwin/object-storage-core";

import { S3ClientWrapperFactory } from "../server";

import { S3ClientStorage } from "./S3ClientStorage";

export class S3ClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = "s3";

  public override register(container: DIContainer): void {
    container.registerFactory<S3ClientWrapperFactory>(
      CoreTypes.Client.clientWrapperFactory,
      () => new S3ClientWrapperFactory()
    );
    container.registerFactory<ClientStorage>(
      ClientStorage,
      (c: DIContainer) => {
        return new S3ClientStorage(
          c.resolve(CoreTypes.Client.clientWrapperFactory)
        );
      }
    );
  }
}
