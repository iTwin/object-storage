/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientStorage, ServerStorage } from "@itwin/object-storage-core";

interface StorageIntegrationTestsConfig {
  serverStorage: ServerStorage;
  serverStorage2: ServerStorage;
  clientStorage: ClientStorage;
}

export let config: StorageIntegrationTestsConfig;

export function setOptions(options: StorageIntegrationTestsConfig): void {
  config = {
    ...config,
    ...options,
  };
}
