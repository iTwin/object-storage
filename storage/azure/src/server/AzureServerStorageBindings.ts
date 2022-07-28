/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { Container } from "inversify";

import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import { DependencyConfig } from "@itwin/cloud-agnostic-core";
import {
  ServerStorage,
  ServerStorageDependency,
} from "@itwin/object-storage-core";

import { Types } from "../common";

import {
  AzureServerStorage,
  AzureServerStorageConfig,
} from "./AzureServerStorage";
import { BlobServiceClientWrapper } from "./wrappers/BlobServiceClientWrapper";

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
      throw new ConfigError<AzureServerStorageConfig>("baseUrl");

    // if (config.instanceName) {
    //   container
    //     .bind<AzureServerStorageConfig>(Types.AzureServer.config)
    //     .toConstantValue(config)
    //     .when(constraint => {
    //       const ancestorTargetName = constraint.parentRequest?.target.metadata.find(m => m.key === "named")?.value;
    //       return ancestorTargetName === config.instanceName;// TODO
    //     });

    //   container.
    //     bind(ServerStorage)
    //     .to(AzureServerStorage)
    //     .inSingletonScope()
    //     .whenTargetNamed(config.instanceName);

    //   container.bind(BlobServiceClientWrapper).toSelf().inSingletonScope()
    //     .when(constraint => {
    //       const ancestorTargetName = constraint.parentRequest?.target.metadata.find(m => m.key === "named")?.value;
    //       return ancestorTargetName === config.instanceName;// TODO
    //     });

    //   container
    //     .bind(BlobServiceClient)
    //     .toConstantValue(
    //       new BlobServiceClient(
    //         config.baseUrl,
    //         new StorageSharedKeyCredential(config.accountName, config.accountKey)
    //       )
    //     )
    //     .when(constraint => {
    //       const ancestorTargetName = constraint.parentRequest?.parentRequest?.target.metadata.find(m => m.key === "named")?.value;
    //       return ancestorTargetName === config.instanceName;// TODO
    //     });

    // } else {
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
    // }
  }

  public override registerInstance(
    container: Container,
    instanceConfig: AzureServerStorageBindingsConfig
  ): void {
    const childContainer = container.createChild();

    this.register(childContainer, instanceConfig);

    container.bind(ServerStorage).toDynamicValue(() => {
      return childContainer.get(ServerStorage);
    }).inSingletonScope().whenTargetNamed(instanceConfig.instanceName!);
  }
}
