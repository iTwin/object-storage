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
  Types,
} from "@itwin/object-storage-core";
import {
  S3ClientWrapper,
  S3ServerStorageBindings,
  S3ServerStorageBindingsConfig,
  S3ServerStorageConfig,
  Types as S3Types,
} from "@itwin/object-storage-s3";

import { createClient } from "./internal";
import { MinioPresignedUrlProvider } from "./MinioPresignedUrlProvider";
import { MinioServerStorage } from "./MinioServerStorage";

export class MinioServerStorageBindings extends S3ServerStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: DIContainer,
    config: S3ServerStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.unregister(Types.Server.presignedUrlProvider);
    container.registerFactory<PresignedUrlProvider>(
      Types.Server.presignedUrlProvider,
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
    container.unregister(ServerStorage);
    container.registerFactory<ServerStorage>(
      ServerStorage,
      (c: DIContainer) =>
        new MinioServerStorage(
          c.resolve(S3ClientWrapper),
          c.resolve<PresignedUrlProvider>(Types.Server.presignedUrlProvider),
          c.resolve<TransferConfigProvider>(Types.Server.transferConfigProvider)
        )
    );
  }
}
