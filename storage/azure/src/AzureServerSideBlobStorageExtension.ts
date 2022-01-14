/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { Container } from "inversify";

import {
  ConfigError,
  ExtensionConfig,
} from "@itwin/cloud-agnostic-core";
import {
  ServerSideStorage,
  ServerSideStorageExtension,
} from "@itwin/object-storage-core";

import {
  AzureServerSideBlobStorage,
  AzureServerSideBlobStorageConfig,
} from "./AzureServerSideBlobStorage";
import { BlobServiceClientWrapper } from "./BlobServiceClientWrapper";
import { Types } from "./Types";

export type AzureServerSideStorageExtensionConfig =
  AzureServerSideBlobStorageConfig & ExtensionConfig;

export class AzureServerSideBlobStorageExtension extends ServerSideStorageExtension {
  public readonly extensionName: string = "azure";

  public override bind(
    container: Container,
    config: AzureServerSideStorageExtensionConfig
  ): void {
    if (!config.accountName)
      throw new ConfigError<AzureServerSideBlobStorageConfig>("accountName");
    if (!config.accountKey)
      throw new ConfigError<AzureServerSideBlobStorageConfig>("accountKey");
    if (!config.baseUrl)
      config.baseUrl = `https://${config.accountName}.blob.core.windows.net`;

    container
      .bind<AzureServerSideBlobStorageConfig>(Types.ServerSide.config)
      .toConstantValue(config);

    container.bind(ServerSideStorage).to(AzureServerSideBlobStorage);
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
