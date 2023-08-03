/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {
  ObjectReference,
  ServerStorage,
  TransferConfig,
} from "@itwin/object-storage-core";

import { TestRemoteDirectory } from "../utils";
import {
  assertQueriedObjects,
  createObjectsReferences,
} from "../utils/Helpers";

use(chaiAsPromised);

export async function testDeleteObjectWithTransferConfig(
  serverStorage: ServerStorage,
  testDirectory: TestRemoteDirectory,
  deleteFunction: (
    reference: ObjectReference,
    transferConfig: TransferConfig
  ) => Promise<void>
): Promise<void> {
  const contentBuffer = Buffer.from("test-delete-object-with-config");
  const uploadedFile: ObjectReference = await testDirectory.uploadFile(
    { objectName: "test-delete-object-with-config.txt" },
    contentBuffer,
    undefined
  );

  expect(await serverStorage.objectExists(uploadedFile)).to.be.true;
  const transferConfig = await serverStorage.getDirectoryAccessConfig(
    testDirectory.baseDirectory
  );

  await deleteFunction(uploadedFile, transferConfig);
  expect(await serverStorage.objectExists(uploadedFile)).to.be.false;
}

export async function testListObjectsWithTransferConfig(
  serverStorage: ServerStorage,
  testDirectory: TestRemoteDirectory,
  listFunction: (
    baseDirectory: string,
    transferConfig: TransferConfig
  ) => Promise<ObjectReference[]>
): Promise<void> {
  const references = await createObjectsReferences(testDirectory, 3);
  const baseDirectory = testDirectory.baseDirectory;
  const transferConfig = await serverStorage.getDirectoryAccessConfig(
    baseDirectory
  );

  const queriedObjects = await listFunction(
    baseDirectory.baseDirectory,
    transferConfig
  );

  assertQueriedObjects(queriedObjects, references);
}
