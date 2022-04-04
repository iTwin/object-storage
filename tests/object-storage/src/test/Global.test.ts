/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";

import { TestLocalFileManager, TestRemoteDirectoryManager } from "./Helpers";

export const testDirectoryManager = new TestRemoteDirectoryManager();
export const testLocalFileManager = new TestLocalFileManager(
  path.join(process.cwd(), "lib", "tempFiles")
);

beforeEach(async () => {
  await Promise.all([
    testDirectoryManager.purgeCreatedDirectories(),
    testLocalFileManager.purgeCreatedFiles(),
  ]);
});

after(async () => {
  await Promise.all([
    testDirectoryManager.purgeCreatedDirectories(),
    testLocalFileManager.purgeCreatedFiles(),
  ]);
});
