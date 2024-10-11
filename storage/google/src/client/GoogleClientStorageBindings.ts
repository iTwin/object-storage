/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  ClientStorage,
  ClientStorageDependency,
} from "@itwin/object-storage-core";

import { StorageWrapperFactory } from "../common/wrappers";

import { GoogleClientStorage } from "./GoogleClientStorage";

export class GoogleClientStorageBindings extends ClientStorageDependency {
  public readonly dependencyName: string = "google";

  public override register(container: Container): void {
    container.bind(StorageWrapperFactory).toSelf().inSingletonScope();
    container.bind(ClientStorage).to(GoogleClientStorage).inSingletonScope();
  }
}
