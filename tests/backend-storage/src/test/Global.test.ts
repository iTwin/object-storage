/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";

import { config } from "./Config";
import { TestLocalFileManager, TestRemoteDirectoryManager } from "./utils";

export const testDirectoryManager = new TestRemoteDirectoryManager(
  config.serverStorage
);
export const secondaryTestDirectoryManager = new TestRemoteDirectoryManager(
  config.serverStorage2
);
export const testLocalFileManager = new TestLocalFileManager(
  path.join(process.cwd(), "lib", "tempFiles")
);

beforeEach(async () => {
  await Promise.all([
    testDirectoryManager.purgeCreatedDirectories(),
    secondaryTestDirectoryManager.purgeCreatedDirectories(),
    testLocalFileManager.purgeCreatedFiles(),
  ]);
});

after(async () => {
  await Promise.all([
    testDirectoryManager.purgeCreatedDirectories(),
    secondaryTestDirectoryManager.purgeCreatedDirectories(),
    testLocalFileManager.purgeCreatedFiles(),
  ]);
});
