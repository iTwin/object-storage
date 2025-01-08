/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Types as CoreTypes } from "@itwin/object-storage-core/lib/frontend";
import { S3FrontendStorageBindings } from "@itwin/object-storage-s3/lib/frontend";

import { DIContainer } from "@itwin/cloud-agnostic-core";

import { FrontendOssS3ClientWrapperFactory } from "./wrappers";

export class OssFrontendStorageBindings extends S3FrontendStorageBindings {
  public override register(container: DIContainer): void {
    super.register(container);

    container.unregister(CoreTypes.Frontend.clientWrapperFactory);
    container.registerFactory(
      CoreTypes.Frontend.clientWrapperFactory,
      () => new FrontendOssS3ClientWrapperFactory()
    );
  }
}
