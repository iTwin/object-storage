/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
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
