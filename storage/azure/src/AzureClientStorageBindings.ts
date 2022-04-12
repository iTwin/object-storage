/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  ClientStorage,
  ClientStorageDependency,
} from "@itwin/object-storage-core";

import { AzureClientStorage } from "./AzureClientStorage";
import { CommonBindings } from "./CommonBindings";

export class AzureClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(container: Container): void {
    CommonBindings.register(container);
    container.bind(ClientStorage).to(AzureClientStorage);
  }
}
