/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorage } from "@itwin/object-storage-core/lib/frontend";

import {
  FrontendServerStorageProxy,
  FrontendTestRemoteDirectoryManager,
} from "..";

export interface TestProps {
  serverStorage: FrontendServerStorageProxy;
  directoryManager: FrontendTestRemoteDirectoryManager;
  frontendStorage: FrontendStorage;
}
