/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientStorage, ServerStorage, FrontendStorage } from "@itwin/object-storage-core";

interface StorageIntegrationTestsConfig {
  serverStorage: ServerStorage;
  clientStorage: ClientStorage;
  frontendStorage: FrontendStorage;
}

export let config: StorageIntegrationTestsConfig;

export function setOptions(options: StorageIntegrationTestsConfig): void {
  config = {
    ...config,
    ...options,
  };
}
