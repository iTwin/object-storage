/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Client } from "minio";

import { DIContainer } from "@itwin/cloud-agnostic-core";
import {
  PresignedUrlProvider,
  ServerStorage,
  TransferConfigProvider,
  Types as CoreTypes,
} from "@itwin/object-storage-core";
import {
  S3ClientWrapper,
  S3ServerStorageBindings,
  S3ServerStorageBindingsConfig,
  S3ServerStorageConfig,
  Types as S3Types,
  StsWrapper,
} from "@itwin/object-storage-s3";

import { Constants } from "../common";

import { createClient } from "./internal";
import { MinioPresignedUrlProvider } from "./MinioPresignedUrlProvider";
import { MinioServerStorage } from "./MinioServerStorage";
import { MinioTransferConfigProvider } from "./MinioTransferConfigProvider";

export class MinioServerStorageBindings extends S3ServerStorageBindings {
  public override readonly dependencyName: string = Constants.storageType;

  public override register(
    container: DIContainer,
    config: S3ServerStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.unregister(CoreTypes.Server.presignedUrlProvider);
    container.registerFactory<PresignedUrlProvider>(
      CoreTypes.Server.presignedUrlProvider,
      (c: DIContainer) =>
        new MinioPresignedUrlProvider(
          c.resolve(Client),
          c.resolve<string>(S3Types.bucket)
        )
    );

    container.registerFactory<Client>(Client, (c: DIContainer) => {
      const resolvedConfig = c.resolve<S3ServerStorageConfig>(
        S3Types.S3Server.config
      );
      return createClient(resolvedConfig);
    });
    container.unregister(CoreTypes.Server.transferConfigProvider);
    container.registerFactory<TransferConfigProvider>(
      CoreTypes.Server.transferConfigProvider,
      (c: DIContainer) => {
        const resolvedConfig = c.resolve<S3ServerStorageConfig>(
          S3Types.S3Server.config
        );
        return new MinioTransferConfigProvider(
          c.resolve(StsWrapper),
          resolvedConfig
        );
      }
    );
    container.unregister<ServerStorage>(CoreTypes.Server.serverStorage);
    container.registerFactory<ServerStorage>(
      CoreTypes.Server.serverStorage,
      (c: DIContainer) =>
        new MinioServerStorage(
          c.resolve(S3ClientWrapper),
          c.resolve<PresignedUrlProvider>(
            CoreTypes.Server.presignedUrlProvider
          ),
          c.resolve<TransferConfigProvider>(
            CoreTypes.Server.transferConfigProvider
          )
        )
    );
  }
}
