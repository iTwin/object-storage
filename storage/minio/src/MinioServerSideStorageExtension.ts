/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";
import { Client } from "minio";

import {
  PresignedUrlProvider,
  Types,
} from "@itwin/object-storage-core";
import {
  S3ServerSideStorageExtension,
  S3ServerSideStorageExtensionConfig,
} from "@itwin/object-storage-s3";

import { createClient, MinioPresignedUrlProvider } from ".";

export class MinioServerSideStorageExtension extends S3ServerSideStorageExtension {
  public override readonly extensionName: string = "minio";

  public override bind(
    container: Container,
    config: S3ServerSideStorageExtensionConfig
  ): void {
    super.bind(container, config);

    container
      .rebind<PresignedUrlProvider>(Types.ServerSide.presignedUrlProvider)
      .to(MinioPresignedUrlProvider);

    container.bind(Client).toConstantValue(createClient(config));
  }
}
