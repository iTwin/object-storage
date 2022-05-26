/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientStorage } from "@itwin/object-storage-core/lib/client";
import { ServerStorage } from "@itwin/object-storage-core/lib/server";

interface StorageIntegrationTestsConfig {
  serverStorage: ServerStorage;
  clientStorage: ClientStorage;
}

export let config: StorageIntegrationTestsConfig;

export function setOptions(options: StorageIntegrationTestsConfig): void {
  config = {
    ...config,
    ...options,
  };
}
