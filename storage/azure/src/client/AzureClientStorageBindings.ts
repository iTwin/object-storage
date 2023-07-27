/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  ClientStorage,
  ClientStorageDependency,
} from "@itwin/object-storage-core";

import { Types } from "../common";
import { BlobClientWrapperFactory } from "../server/wrappers/BlobClientWrapper/BlobClientWrapperFactory";
import { BlockBlobClientWrapperFactory } from "../server/wrappers/BlockBlobClientWrapper/BlockBlobClientWrapperFactory";
import { ContainerClientWrapperFactory } from "../server/wrappers/ContainerClientWrapper/ContainerClientWrapperFactory";

import { AzureClientStorage } from "./AzureClientStorage";

export class AzureClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(container: Container): void {
    container
      .bind(Types.Client.blockBlobClientWrapperFactory)
      .to(BlockBlobClientWrapperFactory)
      .inSingletonScope();
    container
      .bind(Types.Client.blobClientWrapperFactory)
      .to(BlobClientWrapperFactory)
      .inSingletonScope();
    container
      .bind(Types.Client.containerClientWrapperFactory)
      .to(ContainerClientWrapperFactory)
      .inSingletonScope();
    container.bind(ClientStorage).to(AzureClientStorage).inSingletonScope();
  }
}
