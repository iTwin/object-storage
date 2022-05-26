/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ClientStorage } from "@itwin/object-storage-core/lib/client";
import { S3ClientStorageBindings } from "@itwin/object-storage-s3";

import { MinioClientStorage } from "./MinioClientStorage";

export class MinioClientStorageBindings extends S3ClientStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(container: Container): void {
    super.register(container);

    container.rebind(ClientStorage).to(MinioClientStorage).inSingletonScope();
  }
}
