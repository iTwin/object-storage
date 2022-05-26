/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { Container } from "inversify";

import { ConfigError, DependencyConfig } from "@itwin/cloud-agnostic-core";
import { ServerStorage, ServerStorageDependency } from "@itwin/object-storage-core/lib/server";
import { Types } from "../common";
import { AzureServerStorage, AzureServerStorageConfig } from "./AzureServerStorage";
import { BlobServiceClientWrapper } from "./wrappers/BlobServiceClientWrapper";

export type AzureServerStorageBindingsConfig = AzureServerStorageConfig & DependencyConfig;

export class AzureServerStorageBindings extends ServerStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(
    container: Container,
    config: AzureServerStorageBindingsConfig
  ): void {
    if (!config.accountName)
      throw new ConfigError<AzureServerStorageConfig>("accountName");
    if (!config.accountKey)
      throw new ConfigError<AzureServerStorageConfig>("accountKey");
    if (!config.baseUrl)
      throw new ConfigError<AzureServerStorageConfig>("baseUrl");

    container
      .bind<AzureServerStorageConfig>(Types.AzureServer.config)
      .toConstantValue(config);

    container.bind(ServerStorage).to(AzureServerStorage).inSingletonScope();
    container.bind(BlobServiceClientWrapper).toSelf().inSingletonScope();
    container
      .bind(BlobServiceClient)
      .toConstantValue(
        new BlobServiceClient(
          config.baseUrl,
          new StorageSharedKeyCredential(config.accountName, config.accountKey)
        )
      );
  }
}
