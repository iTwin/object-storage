/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";
import { Container } from "inversify";

import { TransferConfigProvider, Types } from "@itwin/object-storage-core";
import {
  S3ServerSideStorageExtension,
  S3ServerSideStorageExtensionConfig,
} from "@itwin/object-storage-s3";

import { createCore } from "./Helpers";

import { OssTransferConfigProvider } from ".";

export class OssServerSideStorageExtension extends S3ServerSideStorageExtension {
  public override readonly extensionName: string = "oss";

  public override bind(
    container: Container,
    config: S3ServerSideStorageExtensionConfig
  ): void {
    super.bind(container, config);

    container
      .rebind<TransferConfigProvider>(Types.ServerSide.transferConfigProvider)
      .to(OssTransferConfigProvider);
    container.bind(Core).toConstantValue(createCore(config));
  }
}
