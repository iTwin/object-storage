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
  ServerSideStorage,
  ServerSideStorageDependency,
} from "@itwin/object-storage-core";

import {
  AzureServerSideStorage,
  AzureServerSideStorageConfig,
} from "./AzureServerSideStorage";
import { BlobServiceClientWrapper } from "./BlobServiceClientWrapper";
import { Types } from "./Types";

export type AzureServerSideStorageBindingsConfig =
  AzureServerSideStorageConfig & DependencyConfig;

export class AzureServerSideStorageBindings extends ServerSideStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(
    container: Container,
    config: AzureServerSideStorageBindingsConfig
  ): void {
    if (!config.accountName)
      throw new ConfigError<AzureServerSideStorageConfig>("accountName");
    if (!config.accountKey)
      throw new ConfigError<AzureServerSideStorageConfig>("accountKey");
    if (!config.baseUrl)
      config.baseUrl = `https://${config.accountName}.blob.core.windows.net`;

    container
      .bind<AzureServerSideStorageConfig>(Types.ServerSide.config)
      .toConstantValue(config);

    container.bind(ServerSideStorage).to(AzureServerSideStorage);
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
