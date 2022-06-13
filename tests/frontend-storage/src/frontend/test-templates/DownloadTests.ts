/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { ObjectReference } from "@itwin/object-storage-core";

import {
  assertArrayBuffer,
  assertReadableStream,
  stringToArrayBuffer,
} from "../Helpers";

import { TestProps } from "./Interfaces";

async function setupDownload(testName: string, test: TestProps) {
  const data = testName;
  const dataBuffer = stringToArrayBuffer(data);
  const directory = await test.directoryManager.createNew();
  const reference: ObjectReference = {
    baseDirectory: directory.baseDirectory,
    objectName: `${testName}.txt`,
  };
  await test.serverStorage.upload({ data, reference });
  return { data, dataBuffer, directory, reference };
}

async function setupDownloadUrl(testName: string, test: TestProps) {
  const setup = await setupDownload(testName, test);
  const url = await test.serverStorage.getDownloadUrl({
    reference: setup.reference,
  });
  return { ...setup, url };
}

async function setupDownloadConfig(testName: string, test: TestProps) {
  const setup = await setupDownload(testName, test);
  const transferConfig = await test.serverStorage.getDownloadConfig({
    directory: setup.directory,
  });
  return { ...setup, transferConfig };
}

export async function testDownloadFromUrlToBuffer(
  test: TestProps
): Promise<void> {
  const { url, dataBuffer } = await setupDownloadUrl(
    "test-download-from-url-to-buffer",
    test
  );
  const responseBuffer = await test.frontendStorage.download({
    url,
    transferType: "buffer",
  });
  assertArrayBuffer(responseBuffer, dataBuffer);
}

export async function testDownloadFromUrlToStream(
  test: TestProps
): Promise<void> {
  const { url, dataBuffer } = await setupDownloadUrl(
    "test-download-from-url-to-stream",
    test
  );
  const responseStream = await test.frontendStorage.download({
    url,
    transferType: "stream",
  });
  await assertReadableStream(responseStream, dataBuffer);
}

export async function testDownloadToBufferWithConfig(
  test: TestProps
): Promise<void> {
  const { reference, transferConfig, dataBuffer } = await setupDownloadConfig(
    "test-download-to-buffer-with-config",
    test
  );
  const responseBuffer = await test.frontendStorage.download({
    reference,
    transferConfig,
    transferType: "buffer",
  });
  assertArrayBuffer(responseBuffer, dataBuffer);
}

export async function testDownloadToStreamWithConfig(
  test: TestProps
): Promise<void> {
  const { reference, transferConfig, dataBuffer } = await setupDownloadConfig(
    "test-download-to-stream-with-config",
    test
  );
  const responseStream = await test.frontendStorage.download({
    reference,
    transferConfig,
    transferType: "stream",
  });
  await assertReadableStream(responseStream, dataBuffer);
}
