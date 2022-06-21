/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  Types as CoreTypes,
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core/lib/frontend";

import { S3FrontendStorage } from "./S3FrontendStorage";
import { FrontendS3ClientWrapperFactory } from "./wrappers";

export class S3FrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = "s3";

  public override register(container: Container): void {
    container
      .bind(CoreTypes.Frontend.clientWrapperFactory)
      .to(FrontendS3ClientWrapperFactory)
      .inSingletonScope();
    container.bind(FrontendStorage).to(S3FrontendStorage).inSingletonScope();
  }
}
