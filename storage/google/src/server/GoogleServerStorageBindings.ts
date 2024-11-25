/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Container } from "inversify";

import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import { DependencyConfig } from "@itwin/cloud-agnostic-core";
import {
  ServerStorage,
  ServerStorageDependency,
} from "@itwin/object-storage-core";

import { Types } from "../common";
import {
  GoogleStorageConfig,
  StorageWrapper,
  StorageWrapperFactory,
} from "../server/wrappers";

import { GoogleServerStorage } from "./GoogleServerStorage";
import { StorageControlClientWrapper } from "./wrappers/StorageControlClientWrapper";

export type GoogleServerStorageBindingsConfig = GoogleStorageConfig &
  DependencyConfig;

export class GoogleServerStorageBindings extends ServerStorageDependency {
  public readonly dependencyName: string = "google";

  public override register(
    container: Container,
    config: GoogleServerStorageBindingsConfig
  ): void {
    if (!config.projectId)
      throw new ConfigError<GoogleStorageConfig>("projectId");
    if (!config.bucketName)
      throw new ConfigError<GoogleStorageConfig>("bucketName");

    container
      .bind<GoogleStorageConfig>(Types.GoogleServer.config)
      .toConstantValue(config);
    container.bind(ServerStorage).to(GoogleServerStorage).inSingletonScope();

    container.bind(StorageControlClientWrapper).toSelf().inSingletonScope();
    container.bind(StorageWrapperFactory).toSelf().inSingletonScope();
    container
      .bind(StorageWrapper)
      .toDynamicValue((context) => {
        const factory = context.container.get(StorageWrapperFactory);
        const config = context.container.get<GoogleStorageConfig>(
          Types.GoogleServer.config
        );
        return factory.createDefaultApplication(config);
      })
      .inSingletonScope();
  }
}
