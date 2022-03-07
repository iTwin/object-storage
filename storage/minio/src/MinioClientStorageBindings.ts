/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ClientStorage } from "@itwin/object-storage-core";
import {
  S3ClientStorageBindings,
  S3ClientStorageBindingsConfig,
} from "@itwin/object-storage-s3";

import { MinioClientStorage } from "./MinioClientStorage";

export class MinioClientStorageBindings extends S3ClientStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: Container,
    config: S3ClientStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.rebind(ClientStorage).to(MinioClientStorage);
  }
}
