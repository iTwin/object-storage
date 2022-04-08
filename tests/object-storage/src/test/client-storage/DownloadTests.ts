/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientStorage, ObjectReference } from "@itwin/object-storage-core";
import { assertBuffer, assertStream, TestDirectory } from "../Helpers";
import { testDirectoryManager } from "../Global.test";
import { config } from "../Config";

const { serverStorage } = config;

export async function testDownloadFromUrlToBuffer(storageUnderTest: ClientStorage): Promise<void> {
  const contentBuffer = Buffer.from("test-download-from-url-to-buffer");
  const testDirectory: TestDirectory =
    await testDirectoryManager.createNew();
  const uploadedFile: ObjectReference = await testDirectory.uploadFile(
    { objectName: "file-to-download-from-url.txt" },
    contentBuffer,
    undefined
  );

  const downloadUrl = await serverStorage.getDownloadUrl(uploadedFile);
  const response = await storageUnderTest.download({
    url: downloadUrl,
    transferType: "buffer",
  });

  assertBuffer(response, contentBuffer);
}

export async function testDownloadFromUrlToStream(storageUnderTest: ClientStorage): Promise<void> {
  const contentBuffer = Buffer.from("test-download-from-url-to-stream");
  const testDirectory: TestDirectory =
    await testDirectoryManager.createNew();
  const uploadedFile: ObjectReference = await testDirectory.uploadFile(
    { objectName: "file-to-download-from-url.txt" },
    contentBuffer,
    undefined
  );

  const downloadUrl = await serverStorage.getDownloadUrl(uploadedFile);
  const response = await storageUnderTest.download({
    url: downloadUrl,
    transferType: "stream",
  });

  await assertStream(response, contentBuffer);
}

