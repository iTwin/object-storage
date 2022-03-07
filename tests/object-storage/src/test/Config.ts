/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import {
  ClientSideStorage,
  ServerSideStorage,
} from "@itwin/object-storage-core";

interface StorageIntegrationTestsConfig {
  serverSideStorage: ServerSideStorage;
  clientSideStorage: ClientSideStorage;
}

export let config: StorageIntegrationTestsConfig;

export function setOptions(options: StorageIntegrationTestsConfig): void {
  config = {
    ...config,
    ...options,
  };
}
