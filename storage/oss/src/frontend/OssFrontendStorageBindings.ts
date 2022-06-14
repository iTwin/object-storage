/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  Types as CoreTypes
} from "@itwin/object-storage-core/lib/frontend";
import { S3FrontendStorageBindings } from "@itwin/object-storage-s3/lib/frontend";

import { FrontendOssS3ClientWrapperFactory } from "./wrappers";

export class OssFrontendStorageBindings extends S3FrontendStorageBindings {
  public override register(container: Container): void {
    super.register(container);

    container
      .rebind(CoreTypes.Frontend.clientWrapperFactory)
      .to(FrontendOssS3ClientWrapperFactory)
      .inSingletonScope();
  }
}
