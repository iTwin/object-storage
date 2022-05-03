/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  ClientStorage,
  ClientStorageDependency,
  Types as CoreTypes,
} from "@itwin/object-storage-core";

import { S3ClientWrapperFactory } from "../frontend";

import { S3ClientStorage } from "./S3ClientStorage";

export class S3ClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = "s3";

  public override register(container: Container): void {
    container
      .bind(CoreTypes.Client.clientWrapperFactory)
      .to(S3ClientWrapperFactory)
      .inSingletonScope();
    container.bind(ClientStorage).to(S3ClientStorage);
  }
}
