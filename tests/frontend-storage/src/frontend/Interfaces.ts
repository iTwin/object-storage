/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorage } from "@itwin/object-storage-core/lib/frontend";

import { ServerStorageProxyFrontend } from "../backend/server-storage-proxy/Frontend";

import { FrontendTestRemoteDirectoryManager } from "./utils/RemoteDirectoryManager";

export interface TestCase {
  serverStorage: ServerStorageProxyFrontend;
  directoryManager: FrontendTestRemoteDirectoryManager;
  frontendStorage: FrontendStorage;
}
