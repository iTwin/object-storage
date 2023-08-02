/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientStorage, ServerStorage } from "@itwin/object-storage-core";

interface StorageUnitTestsConfig {
  serverStorage: ServerStorage;
  clientStorage: ClientStorage;
}

export let config: StorageUnitTestsConfig;

export function setOptions(options: StorageUnitTestsConfig): void {
  config = {
    ...config,
    ...options,
  };
}
