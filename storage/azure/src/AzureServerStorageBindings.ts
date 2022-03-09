/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { Container } from "inversify";

import { ConfigError, DependencyConfig } from "@itwin/cloud-agnostic-core";
import {
  ServerStorage,
  ServerStorageDependency,
} from "@itwin/object-storage-core";

import {
  AzureServerStorage,
  AzureServerStorageConfig,
} from "./AzureServerStorage";
import { BlobServiceClientWrapper } from "./BlobServiceClientWrapper";
import { Types } from "./Types";

export type AzureServerStorageBindingsConfig = AzureServerStorageConfig &
  DependencyConfig;

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
      config.baseUrl = `https://${config.accountName}.blob.core.windows.net`;

    container
      .bind<AzureServerStorageConfig>(Types.Server.config)
      .toConstantValue(config);

    container.bind(ServerStorage).to(AzureServerStorage);
    container.bind(BlobServiceClientWrapper).toSelf();
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