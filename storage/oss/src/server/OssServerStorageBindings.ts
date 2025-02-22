/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";

import { DIContainer } from "@itwin/cloud-agnostic-core";
import {
  TransferConfigProvider,
  Types as CoreTypes,
} from "@itwin/object-storage-core";
import {
  S3ServerStorageBindings,
  S3ServerStorageBindingsConfig,
  S3ServerStorageConfig,
  Types as S3Types,
} from "@itwin/object-storage-s3";

import { Constants } from "../common";

import { createCore } from "./internal";
import { OssTransferConfigProvider } from "./OssTransferConfigProvider";

export class OssServerStorageBindings extends S3ServerStorageBindings {
  public override readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config: S3ServerStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.unregister(CoreTypes.Server.transferConfigProvider);
    container.registerFactory<TransferConfigProvider>(
      CoreTypes.Server.transferConfigProvider,
      (c: DIContainer) => {
        return new OssTransferConfigProvider(
          c.resolve<Core>(Core),
          c.resolve<S3ServerStorageConfig>(S3Types.S3Server.config)
        );
      }
    );
    container.registerFactory(Core, (c: DIContainer) => {
      const resolvedConfig = c.resolve<S3ServerStorageConfig>(
        S3Types.S3Server.config
      );
      return createCore(resolvedConfig);
    });
  }
}
