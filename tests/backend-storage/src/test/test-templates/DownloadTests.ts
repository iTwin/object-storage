/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ClientStorage,
  FrontendStorage,
  ObjectReference,
} from "@itwin/object-storage-core";

import { config } from "../Config";
import { testDirectoryManager } from "../Global.test";
import { assertBuffer, assertStream, TestRemoteDirectory } from "../utils";

const { serverStorage } = config;

export async function testDownloadFromUrlToBuffer(
  testedStorage: FrontendStorage | ClientStorage
): Promise<void> {
  const contentBuffer = Buffer.from("test-download-from-url-to-buffer");
  const testDirectory: TestRemoteDirectory =
    await testDirectoryManager.createNew();
  const uploadedFile: ObjectReference = await testDirectory.uploadFile(
    { objectName: "file-to-download-from-url.txt" },
    contentBuffer,
    undefined
  );

  const downloadUrl = await serverStorage.getDownloadUrl(uploadedFile);
  const response = await testedStorage.download({
    url: downloadUrl,
    transferType: "buffer",
  });

  assertBuffer(response, contentBuffer);
}

export async function testDownloadFromUrlToStream(
  testedStorage: FrontendStorage | ClientStorage
): Promise<void> {
  const contentBuffer = Buffer.from("test-download-from-url-to-stream");
  const testDirectory: TestRemoteDirectory =
    await testDirectoryManager.createNew();
  const uploadedFile: ObjectReference = await testDirectory.uploadFile(
    { objectName: "file-to-download-from-url.txt" },
    contentBuffer,
    undefined
  );

  const downloadUrl = await serverStorage.getDownloadUrl(uploadedFile);
  const response = await testedStorage.download({
    url: downloadUrl,
    transferType: "stream",
  });

  await assertStream(response, contentBuffer);
}

export async function testDownloadToBufferWithConfig(
  testedStorage: FrontendStorage | ClientStorage
): Promise<void> {
  const contentBuffer = Buffer.from("test-download-to-buffer-with-config");
  const testDirectory: TestRemoteDirectory =
    await testDirectoryManager.createNew();
  const uploadedFile: ObjectReference = await testDirectory.uploadFile(
    { objectName: "file-to-download-with-config.txt" },
    contentBuffer,
    undefined
  );

  const downloadConfig = await serverStorage.getDownloadConfig(
    testDirectory.baseDirectory
  );
  const response = await testedStorage.download({
    reference: uploadedFile,
    transferConfig: downloadConfig,
    transferType: "buffer",
  });

  assertBuffer(response, contentBuffer);
}

export async function testDownloadToStreamWithConfig(
  testedStorage: FrontendStorage | ClientStorage
): Promise<void> {
  const contentBuffer = Buffer.from("test-download-to-stream-with-config");
  const testDirectory: TestRemoteDirectory =
    await testDirectoryManager.createNew();
  const uploadedFile: ObjectReference = await testDirectory.uploadFile(
    { objectName: "file-to-download-with-config.txt" },
    contentBuffer,
    undefined
  );

  const downloadConfig = await serverStorage.getDownloadConfig(
    testDirectory.baseDirectory
  );
  const response = await testedStorage.download({
    reference: uploadedFile,
    transferConfig: downloadConfig,
    transferType: "stream",
  });

  await assertStream(response, contentBuffer);
}
