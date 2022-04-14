/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";
import { Client } from "minio";

import {
  PresignedUrlProvider,
  ServerStorage,
  Types,
} from "@itwin/object-storage-core";
import {
  S3ServerStorageBindings,
  S3ServerStorageBindingsConfig,
} from "@itwin/object-storage-s3";

import { createClient } from "./Helpers";
import { MinioPresignedUrlProvider } from "./MinioPresignedUrlProvider";
import { MinioServerStorage } from "./MinioServerStorage";

export class MinioServerStorageBindings extends S3ServerStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: Container,
    config: S3ServerStorageBindingsConfig
  ): void {
    super.register(container, config);

    container
      .rebind<PresignedUrlProvider>(Types.Server.presignedUrlProvider)
      .to(MinioPresignedUrlProvider);

    container.bind(Client).toConstantValue(createClient(config));
    container.rebind(ServerStorage).to(MinioServerStorage);
  }
}
