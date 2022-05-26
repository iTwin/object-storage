/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";
import { Container } from "inversify";

import { Types } from "@itwin/object-storage-core/lib/common";
import { TransferConfigProvider } from "@itwin/object-storage-core/lib/server";
import {
  S3ServerStorageBindings,
  S3ServerStorageBindingsConfig,
} from "@itwin/object-storage-s3";

import { createCore } from "./Helpers";
import { OssTransferConfigProvider } from "./OssTransferConfigProvider";

export class OssServerStorageBindings extends S3ServerStorageBindings {
  public override readonly dependencyName: string = "oss";

  public override register(
    container: Container,
    config: S3ServerStorageBindingsConfig
  ): void {
    super.register(container, config);

    container
      .rebind<TransferConfigProvider>(Types.Server.transferConfigProvider)
      .to(OssTransferConfigProvider)
      .inSingletonScope();
    container.bind(Core).toConstantValue(createCore(config));
  }
}
