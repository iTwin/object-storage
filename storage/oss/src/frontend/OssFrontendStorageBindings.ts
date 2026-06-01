/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  FrontendStorageBindingsConfig,
  Types as CoreTypes,
} from "@itwin/object-storage-core/lib/frontend";
import { Types as S3Types } from "@itwin/object-storage-s3/lib/common";
import { S3FrontendStorageBindings } from "@itwin/object-storage-s3/lib/frontend";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import { FrontendOssS3ClientWrapperFactory } from "./wrappers";

export class OssFrontendStorageBindings extends S3FrontendStorageBindings {
  public override register(
    container: DIContainer,
    config?: FrontendStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.unregister(CoreTypes.Frontend.clientWrapperFactory);
    container.registerFactory(
      CoreTypes.Frontend.clientWrapperFactory,
      (c: DIContainer) =>
        new FrontendOssS3ClientWrapperFactory(
          c.resolve<FrontendStorageBindingsConfig>(
            S3Types.S3Frontend.config
          ).retryOptions
        )
    );
  }
}
