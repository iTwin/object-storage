/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ClientSideStorage } from "@itwin/object-storage-core";
import {
  S3ClientSideStorageExtension,
  S3ClientSideStorageExtensionConfig,
} from "@itwin/object-storage-s3";

import { MinioClientSideStorage } from "./MinioClientSideStorage";

export class MinioClientSideStorageExtension extends S3ClientSideStorageExtension {
  public override readonly extensionName: string = "minio";

  public override bind(
    container: Container,
    config: S3ClientSideStorageExtensionConfig
  ): void {
    super.bind(container, config);

    container.rebind(ClientSideStorage).to(MinioClientSideStorage);
  }
}
