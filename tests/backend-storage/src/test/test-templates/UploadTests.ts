/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import {
  BaseDirectory,
  ClientStorage,
  Metadata,
  MultipartUploadData,
  ObjectReference,
  TransferConfig,
  TransferData,
} from "@itwin/object-storage-core";

import { config } from "../Config";
import { testDirectoryManager, testLocalFileManager } from "../Global.test";
import {
  checkUploadedFileValidity,
  queryAndAssertMetadata,
  TestRemoteDirectory,
} from "../utils";

const { serverStorage } = config;

interface TestCase {
  dataToAssert: Buffer;
  testedStorage: ClientStorage;
  dataToUpload: TransferData;
}

interface TestCaseWithTransferConfig extends TestCase {
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>;
}

interface MultipartTestCase extends TestCaseWithTransferConfig {
  dataToUpload: MultipartUploadData;
}

async function getTestStream(data: string): Promise<Readable> {
  // TODO: there are more simple ways to create a test stream than to write the
  // data to a file and then read from it. Currently the `streamToBuffer` method
  // does not work with streams created any other way.
  const path = await testLocalFileManager.createAndWriteFile(
    "temp-stream.txt",
    Buffer.from(data)
  );
  return createReadStream(path);
}

export async function testUploadFromBufferToUrl(
  testedStorage: ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${testedStorage.constructor.name}-test-upload-from-buffer-to-url`
  );
  return testUploadToUrl({
    testedStorage,
    dataToUpload: buffer,
    dataToAssert: buffer,
  });
}

export async function testUploadFromStreamToUrl(
  testedStorage: ClientStorage
): Promise<void> {
  const data = `${testedStorage.constructor.name}-test-upload-from-stream-to-url`;
  const stream = await getTestStream(data);
  return testUploadToUrl({
    testedStorage,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testUploadWithRelativeDirFromBufferToUrl(
  testedStorage: ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${testedStorage.constructor.name}-test-upload-from-buffer-to-url-relative-dir`
  );
  return testUploadToUrlWithRelativeDir({
    testedStorage,
    dataToUpload: buffer,
    dataToAssert: buffer,
  });
}

export async function testUploadWithRelativeDirFromStreamToUrl(
  testedStorage: ClientStorage
): Promise<void> {
  const data = `${testedStorage.constructor.name}-test-upload-from-stream-to-url-relative-dir`;
  const stream = await getTestStream(data);
  return testUploadToUrlWithRelativeDir({
    testedStorage,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testUploadWithMetadataFromBufferToUrl(
  testedStorage: ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${testedStorage.constructor.name}-test-upload-from-buffer-to-url-metadata`
  );
  return testUploadToUrlWithMetadata({
    testedStorage,
    dataToUpload: buffer,
    dataToAssert: buffer,
  });
}

export async function testUploadWithMetadataFromStreamToUrl(
  testedStorage: ClientStorage
): Promise<void> {
  const data = `${testedStorage.constructor.name}-test-upload-from-stream-to-url-metadata`;
  const stream = await getTestStream(data);
  return testUploadToUrlWithMetadata({
    testedStorage,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testUploadToUrl(params: TestCase): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    objectName: "test-upload-to-url",
  };

  const uploadUrl = await serverStorage.getUploadUrl(reference);
  await params.testedStorage.upload({
    data: params.dataToUpload,
    url: uploadUrl,
  });

  await checkUploadedFileValidity(reference, params.dataToAssert);
}

export async function testUploadToUrlWithRelativeDir(
  params: TestCase
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
  await params.testedStorage.upload({
    data: params.dataToUpload,
    url: uploadUrl,
  });

  await checkUploadedFileValidity(reference, params.dataToAssert);
}

export async function testUploadToUrlWithMetadata(
  params: TestCase
): Promise<void> {
  const testDirectory: TestRemoteDirectory =
    await testDirectoryManager.createNew();
  const reference: ObjectReference = {
    baseDirectory: testDirectory.baseDirectory.baseDirectory,
    objectName: "test-upload-to-url-metadata",
  };
  const metadata: Metadata = {
    test: "test-metadata",
  };

  const uploadUrl = await serverStorage.getUploadUrl(reference);
  await params.testedStorage.upload({
    data: params.dataToUpload,
    url: uploadUrl,
    metadata,
  });

  await checkUploadedFileValidity(reference, params.dataToAssert);
  await queryAndAssertMetadata(reference, metadata);
}

export async function testUploadFromBufferWithConfig(
  testedStorage: ClientStorage,
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>
): Promise<void> {
  const buffer = Buffer.from(
    `${testedStorage.constructor.name}-test-upload-from-buffer-with-config`
  );
  return testUploadWithConfig({
    testedStorage,
    dataToUpload: buffer,
    dataToAssert: buffer,
    getTransferConfigCallback: getTransferConfigCallback,
  });
}

export async function testUploadFromStreamWithConfig(
  testedStorage: ClientStorage,
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>
): Promise<void> {
  const data = `${testedStorage.constructor.name}-test-upload-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testUploadWithConfig({
    testedStorage,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
    getTransferConfigCallback: getTransferConfigCallback,
  });
}

export async function testUploadWithRelativeDirFromBufferWithConfig(
  testedStorage: ClientStorage,
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>
): Promise<void> {
  const buffer = Buffer.from(
    `${testedStorage.constructor.name}-test-upload-with-relative-dir-from-buffer-with-config`
  );
  return testUploadWithRelativeDirWithConfig({
    testedStorage,
    dataToUpload: buffer,
    dataToAssert: buffer,
    getTransferConfigCallback: getTransferConfigCallback,
  });
}

export async function testUploadWithRelativeDirFromStreamWithConfig(
  testedStorage: ClientStorage,
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>
): Promise<void> {
  const data = `${testedStorage.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testUploadWithRelativeDirWithConfig({
    testedStorage,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
    getTransferConfigCallback: getTransferConfigCallback,
  });
}

export async function testUploadWithMetadataFromBufferWithConfig(
  testedStorage: ClientStorage,
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>
): Promise<void> {
  const buffer = Buffer.from(
    `${testedStorage.constructor.name}-test-upload-with-metadata-from-buffer-with-config`
  );
  return testUploadWithMetadataWithConfig({
    testedStorage,
    dataToUpload: buffer,
    dataToAssert: buffer,
    getTransferConfigCallback: getTransferConfigCallback,
  });
}

export async function testUploadWithMetadataFromStreamWithConfig(
  testedStorage: ClientStorage,
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>
): Promise<void> {
  const data = `${testedStorage.constructor.name}-test-upload-with-metadata-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testUploadWithMetadataWithConfig({
    testedStorage,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
    getTransferConfigCallback: getTransferConfigCallback,
  });
}

export async function testUploadWithConfig(
  params: TestCaseWithTransferConfig
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    objectName: "test-upload-with-config",
  };

  const transferConfig = await params.getTransferConfigCallback(
    testBaseDirectory.baseDirectory
  );

  await params.testedStorage.upload({
    data: params.dataToUpload,
    reference,
    transferConfig: transferConfig,
  });

  await checkUploadedFileValidity(reference, params.dataToAssert);
}

export async function testUploadWithRelativeDirWithConfig(
  params: TestCaseWithTransferConfig
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    relativeDirectory: "relative-1/relative-2",
    objectName: "test-upload-with-relative-dir-with-config",
  };

  const transferConfig = await params.getTransferConfigCallback(
    testBaseDirectory.baseDirectory
  );

  await params.testedStorage.upload({
    data: params.dataToUpload,
    reference,
    transferConfig: transferConfig,
  });

  await checkUploadedFileValidity(reference, params.dataToAssert);
}

export async function testUploadWithMetadataWithConfig(
  params: TestCaseWithTransferConfig
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

  const transferConfig = await params.getTransferConfigCallback(
    testBaseDirectory.baseDirectory
  );

  await params.testedStorage.upload({
    data: params.dataToUpload,
    reference,
    transferConfig: transferConfig,
    metadata,
  });

  await checkUploadedFileValidity(reference, params.dataToAssert);
  await queryAndAssertMetadata(reference, metadata);
}

export async function testMultipartUploadFromStream(
  testedStorage: ClientStorage,
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>
): Promise<void> {
  const data = `${testedStorage.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testMultipartUpload({
    testedStorage,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
    getTransferConfigCallback: getTransferConfigCallback,
  });
}

export async function testMultipartUploadWithRelativeDirFromStream(
  testedStorage: ClientStorage,
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>
): Promise<void> {
  const data = `${testedStorage.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testMultipartUploadWithRelativeDir({
    testedStorage,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
    getTransferConfigCallback: getTransferConfigCallback,
  });
}

export async function testMultipartUploadWithMetadataFromStream(
  testedStorage: ClientStorage,
  getTransferConfigCallback: (directory: string) => Promise<TransferConfig>
): Promise<void> {
  const data = `${testedStorage.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testMultipartUploadWithMetadata({
    testedStorage,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
    getTransferConfigCallback: getTransferConfigCallback,
  });
}

export async function testMultipartUpload(
  params: MultipartTestCase
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    objectName: "test-multipart-upload",
  };

  const transferConfig = await params.getTransferConfigCallback(
    testBaseDirectory.baseDirectory
  );
  await params.testedStorage.uploadInMultipleParts({
    data: params.dataToUpload,
    reference,
    transferConfig: transferConfig,
  });

  await checkUploadedFileValidity(reference, params.dataToAssert);
}

export async function testMultipartUploadWithRelativeDir(
  params: MultipartTestCase
): Promise<void> {
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    relativeDirectory: "relative-1/relative-2",
    objectName: "test-multipart-upload-with-relative-dir",
  };

  const transferConfig = await params.getTransferConfigCallback(
    testBaseDirectory.baseDirectory
  );
  await params.testedStorage.uploadInMultipleParts({
    data: params.dataToUpload,
    reference,
    transferConfig: transferConfig,
  });

  await checkUploadedFileValidity(reference, params.dataToAssert);
}

export async function testMultipartUploadWithMetadata(
  params: MultipartTestCase
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

  const transferConfig = await params.getTransferConfigCallback(
    testBaseDirectory.baseDirectory
  );
  await params.testedStorage.uploadInMultipleParts({
    data: params.dataToUpload,
    reference,
    transferConfig: transferConfig,
    options: { metadata },
  });

  await checkUploadedFileValidity(reference, params.dataToAssert);
  await queryAndAssertMetadata(reference, metadata);
}
