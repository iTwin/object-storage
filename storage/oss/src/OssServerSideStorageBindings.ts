/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";
import { Container } from "inversify";

import { TransferConfigProvider, Types } from "@itwin/object-storage-core";
import {
  S3ServerSideStorageBindings,
  S3ServerSideStorageBindingsConfig,
} from "@itwin/object-storage-s3";

import { createCore } from "./Helpers";

import { OssTransferConfigProvider } from ".";

export class OssServerSideStorageBindings extends S3ServerSideStorageBindings {
  public override readonly dependencyName: string = "oss";

  public override register(
    container: Container,
    config: S3ServerSideStorageBindingsConfig
  ): void {
    super.register(container, config);

    container
      .rebind<TransferConfigProvider>(Types.ServerSide.transferConfigProvider)
      .to(OssTransferConfigProvider);
    container.bind(Core).toConstantValue(createCore(config));
  }
}
