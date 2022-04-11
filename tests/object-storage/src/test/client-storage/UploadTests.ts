/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream, writeFileSync } from "fs";
import { Readable } from "stream";

import {
  BaseDirectory,
  ClientStorage,
  Metadata,
  MultipartUploadData,
  ObjectReference,
  TransferData,
} from "@itwin/object-storage-core";

import { config } from "../Config";
import { testDirectoryManager } from "../Global.test";
import {
  checkUploadedFileValidity,
  queryAndAssertMetadata,
  TestDirectory,
} from "../utils";

const { serverStorage } = config;

function getTestStream(data: string): Readable {
  // TODO
  const path = "C:\\Users\\austeja.kalpakovaite\\Desktop\\foo.txt";
  writeFileSync(path, data);
  return createReadStream(path);
}

export async function testUploadFromBufferToUrl(
  storageUnderTest: ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-from-buffer-to-url`
  );
  return testUploadToUrl(storageUnderTest, buffer, buffer);
}

export async function testUploadFromStreamToUrl(
  storageUnderTest: ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-from-stream-to-url`;
  const stream = getTestStream(data);
  return testUploadToUrl(storageUnderTest, stream, Buffer.from(data));
}

export async function testUploadWithRelativeDirFromBufferToUrl(
  storageUnderTest: ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-from-buffer-to-url-relative-dir`
  );
  return testUploadToUrlWithRelativeDir(storageUnderTest, buffer, buffer);
}

export async function testUploadWithRelativeDirFromStreamToUrl(
  storageUnderTest: ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-from-stream-to-url-relative-dir`;
  const stream = getTestStream(data);
  return testUploadToUrlWithRelativeDir(
    storageUnderTest,
    stream,
    Buffer.from(data)
  );
}

export async function testUploadWithMetadataFromBufferToUrl(
  storageUnderTest: ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-from-buffer-to-url-metadata`
  );
  return testUploadToUrlWithMetadata(storageUnderTest, buffer, buffer);
}

export async function testUploadWithMetadataFromStreamToUrl(
  storageUnderTest: ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-from-stream-to-url-metadata`;
  const stream = getTestStream(data);
  return testUploadToUrlWithMetadata(
    storageUnderTest,
    stream,
    Buffer.from(data)
  );
}

export async function testUploadToUrl(
  storageUnderTest: ClientStorage,
  dataToUpload: TransferData,
  dataToAssert: Buffer
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    objectName: "test-upload-to-url",
  };

  const uploadUrl = await serverStorage.getUploadUrl(reference);
  await storageUnderTest.upload({
    url: uploadUrl,
    data: dataToUpload,
  });

  await checkUploadedFileValidity(reference, dataToAssert);
}

export async function testUploadToUrlWithRelativeDir(
  storageUnderTest: ClientStorage,
  dataToUpload: TransferData,
  dataToAssert: Buffer
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    relativeDirectory: "relative-1/relative-2",
    objectName: "test-upload-to-url-relative-dir",
  };

  const uploadUrl = await serverStorage.getUploadUrl(reference);
  await storageUnderTest.upload({
    url: uploadUrl,
    data: dataToUpload,
  });

  await checkUploadedFileValidity(reference, dataToAssert);
}

export async function testUploadToUrlWithMetadata(
  storageUnderTest: ClientStorage,
  dataToUpload: TransferData,
  dataToAssert: Buffer
): Promise<void> {
  const testDirectory: TestDirectory = await testDirectoryManager.createNew();
  const reference: ObjectReference = {
    baseDirectory: testDirectory.baseDirectory.baseDirectory,
    objectName: "test-upload-to-url-metadata",
  };
  const metadata: Metadata = {
    test: "test-metadata",
  };

  const uploadUrl = await serverStorage.getUploadUrl(reference);
  await storageUnderTest.upload({
    url: uploadUrl,
    data: dataToUpload,
    metadata,
  });

  await checkUploadedFileValidity(reference, dataToAssert);
  await queryAndAssertMetadata(reference, metadata);
}

export async function testUploadFromBufferWithConfig(
  storageUnderTest: ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-from-buffer-with-config`
  );
  return testUploadWithConfig(storageUnderTest, buffer, buffer);
}

export async function testUploadFromStreamWithConfig(
  storageUnderTest: ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-from-stream-with-config`;
  const stream = getTestStream(data);
  return testUploadWithConfig(storageUnderTest, stream, Buffer.from(data));
}

export async function testUploadWithRelativeDirFromBufferWithConfig(
  storageUnderTest: ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-buffer-with-config`
  );
  return testUploadWithRelativeDirWithConfig(storageUnderTest, buffer, buffer);
}

export async function testUploadWithRelativeDirFromStreamWithConfig(
  storageUnderTest: ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = getTestStream(data);
  return testUploadWithRelativeDirWithConfig(
    storageUnderTest,
    stream,
    Buffer.from(data)
  );
}

export async function testUploadWithMetadataFromBufferWithConfig(
  storageUnderTest: ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-with-metadata-from-buffer-with-config`
  );
  return testUploadWithMetadataWithConfig(storageUnderTest, buffer, buffer);
}

export async function testUploadWithMetadataFromStreamWithConfig(
  storageUnderTest: ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-metadata-from-stream-with-config`;
  const stream = getTestStream(data);
  return testUploadWithMetadataWithConfig(
    storageUnderTest,
    stream,
    Buffer.from(data)
  );
}

export async function testUploadWithConfig(
  storageUnderTest: ClientStorage,
  dataToUpload: TransferData,
  dataToAssert: Buffer
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    objectName: "test-upload-with-config",
  };

  const uploadConfig = await serverStorage.getUploadConfig({
    baseDirectory: testBaseDirectory.baseDirectory,
  });
  await storageUnderTest.upload({
    data: dataToUpload,
    reference,
    transferConfig: uploadConfig,
  });

  await checkUploadedFileValidity(reference, dataToAssert);
}

export async function testUploadWithRelativeDirWithConfig(
  storageUnderTest: ClientStorage,
  dataToUpload: TransferData,
  dataToAssert: Buffer
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    relativeDirectory: "relative-1/relative-2",
    objectName: "test-upload-with-relative-dir-with-config",
  };

  const uploadConfig = await serverStorage.getUploadConfig({
    baseDirectory: testBaseDirectory.baseDirectory,
  });
  await storageUnderTest.upload({
    data: dataToUpload,
    reference,
    transferConfig: uploadConfig,
  });

  await checkUploadedFileValidity(reference, dataToAssert);
}

export async function testUploadWithMetadataWithConfig(
  storageUnderTest: ClientStorage,
  dataToUpload: TransferData,
  dataToAssert: Buffer
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    objectName: "test-upload-with-metadata-with-config",
  };
  const metadata: Metadata = {
    test: "test-metadata",
  };

  const uploadConfig = await serverStorage.getUploadConfig({
    baseDirectory: testBaseDirectory.baseDirectory,
  });
  await storageUnderTest.upload({
    data: dataToUpload,
    reference,
    transferConfig: uploadConfig,
    metadata,
  });

  await checkUploadedFileValidity(reference, dataToAssert);
  await queryAndAssertMetadata(reference, metadata);
}

export async function testMultipartUploadFromStream(
  storageUnderTest: ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = getTestStream(data);
  return testMultipartUpload(storageUnderTest, stream, Buffer.from(data));
}

export async function testMultipartUploadWithRelativeDirFromStream(
  storageUnderTest: ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = getTestStream(data);
  return testMultipartUploadWithRelativeDir(
    storageUnderTest,
    stream,
    Buffer.from(data)
  );
}

export async function testMultipartUploadWithMetadataFromStream(
  storageUnderTest: ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = getTestStream(data);
  return testMultipartUploadWithMetadata(
    storageUnderTest,
    stream,
    Buffer.from(data)
  );
}

export async function testMultipartUpload(
  storageUnderTest: ClientStorage,
  dataToUpload: MultipartUploadData,
  dataToAssert: Buffer
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    objectName: "test-multipart-upload",
  };

  const uploadConfig = await serverStorage.getUploadConfig({
    baseDirectory: testBaseDirectory.baseDirectory,
  });
  await storageUnderTest.uploadInMultipleParts({
    data: dataToUpload,
    reference,
    transferConfig: uploadConfig,
  });

  await checkUploadedFileValidity(reference, dataToAssert);
}

export async function testMultipartUploadWithRelativeDir(
  storageUnderTest: ClientStorage,
  dataToUpload: MultipartUploadData,
  dataToAssert: Buffer
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    relativeDirectory: "relative-1/relative-2",
    objectName: "test-multipart-upload-with-relative-dir",
  };

  const uploadConfig = await serverStorage.getUploadConfig({
    baseDirectory: testBaseDirectory.baseDirectory,
  });
  await storageUnderTest.uploadInMultipleParts({
    data: dataToUpload,
    reference,
    transferConfig: uploadConfig,
  });

  await checkUploadedFileValidity(reference, dataToAssert);
}

export async function testMultipartUploadWithMetadata(
  storageUnderTest: ClientStorage,
  dataToUpload: MultipartUploadData,
  dataToAssert: Buffer
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    objectName: "test-multipart-upload-with-metadata",
  };
  const metadata: Metadata = {
    test: "test-metadata",
  };

  const uploadConfig = await serverStorage.getUploadConfig({
    baseDirectory: testBaseDirectory.baseDirectory,
  });
  await storageUnderTest.uploadInMultipleParts({
    data: dataToUpload,
    reference,
    transferConfig: uploadConfig,
    options: { metadata },
  });

  await checkUploadedFileValidity(reference, dataToAssert);
  await queryAndAssertMetadata(reference, metadata);
}
