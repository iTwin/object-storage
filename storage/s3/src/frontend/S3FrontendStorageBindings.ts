/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Types as CoreTypes } from "@itwin/object-storage-core/lib/common";
import {
  FrontendStorage,
  FrontendStorageDependency,
} from "@itwin/object-storage-core/lib/frontend";
import { S3ClientWrapperFactoryFrontend } from "./wrappers";
import { S3FrontendStorage } from "./S3FrontendStorage";

export class S3FrontendStorageBindings extends FrontendStorageDependency {
  public readonly dependencyName: string = "s3";

  public override register(container: Container): void {
    container
      .bind(CoreTypes.Frontend.clientWrapperFactory)
      .to(S3ClientWrapperFactoryFrontend)
      .inSingletonScope();
    container.bind(FrontendStorage).to(S3FrontendStorage).inSingletonScope();
  }
}
