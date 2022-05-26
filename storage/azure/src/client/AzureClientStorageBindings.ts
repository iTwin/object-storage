/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Types } from "@itwin/object-storage-core/lib/common";
import {
  ClientStorage,
  ClientStorageDependency,
} from "@itwin/object-storage-core/lib/client";
import { BlockBlobClientWrapperFactory } from "../server/wrappers/BlockBlobClientWrapperFactory";
import { AzureClientStorage } from "./AzureClientStorage";

export class AzureClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(container: Container): void {
    container
      .bind(Types.Client.clientWrapperFactory)
      .to(BlockBlobClientWrapperFactory)
      .inSingletonScope();
    container.bind(ClientStorage).to(AzureClientStorage).inSingletonScope();
  }
}
