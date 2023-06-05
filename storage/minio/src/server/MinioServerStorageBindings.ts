/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";
import { Client } from "minio";

import {
  Types as CoreTypes,
  PresignedUrlProvider,
  ServerStorage,
} from "@itwin/object-storage-core";
import {
  S3ServerStorageBindings,
  S3ServerStorageBindingsConfig,
} from "@itwin/object-storage-s3";

import { Types } from "../common/Types";

import { createClient } from "./internal";
import { MinioPresignedUrlProvider } from "./MinioPresignedUrlProvider";
import {
  MinioServerStorage,
  MinioServerStorageConfig,
} from "./MinioServerStorage";

type MinioServerStorageBindingsConfig = S3ServerStorageBindingsConfig &
  MinioServerStorageConfig;

export class MinioServerStorageBindings extends S3ServerStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: Container,
    config: MinioServerStorageBindingsConfig
  ): void {
    super.register(container, config);

    container
      .rebind<PresignedUrlProvider>(CoreTypes.Server.presignedUrlProvider)
      .to(MinioPresignedUrlProvider)
      .inSingletonScope();

    container.bind(Client).toConstantValue(createClient(config));
    container.rebind(ServerStorage).to(MinioServerStorage).inSingletonScope();
    container
      .bind<MinioServerStorageConfig>(Types.MinioServer.config)
      .toConstantValue(config);
  }
}
