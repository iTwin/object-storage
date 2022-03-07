/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ClientSideStorage } from "@itwin/object-storage-core";
import {
  S3ClientSideStorageBindings,
  S3ClientSideStorageBindingsConfig,
} from "@itwin/object-storage-s3";

import { MinioClientSideStorage } from "./MinioClientSideStorage";

export class MinioClientSideStorageBindings extends S3ClientSideStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: Container,
    config: S3ClientSideStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.rebind(ClientSideStorage).to(MinioClientSideStorage);
  }
}
