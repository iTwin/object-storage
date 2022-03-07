/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";
import { Client } from "minio";

import { PresignedUrlProvider, Types } from "@itwin/object-storage-core";
import {
  S3ServerSideStorageBindings,
  S3ServerSideStorageBindingsConfig,
} from "@itwin/object-storage-s3";

import { createClient, MinioPresignedUrlProvider } from ".";

export class MinioServerSideStorageBindings extends S3ServerSideStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: Container,
    config: S3ServerSideStorageBindingsConfig
  ): void {
    super.register(container, config);

    container
      .rebind<PresignedUrlProvider>(Types.ServerSide.presignedUrlProvider)
      .to(MinioPresignedUrlProvider);

    container.bind(Client).toConstantValue(createClient(config));
  }
}
