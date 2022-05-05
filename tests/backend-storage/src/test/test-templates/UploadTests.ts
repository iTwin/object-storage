/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import {
  BaseDirectory,
  ClientStorage,
  FrontendMultipartUploadData,
  FrontendStorage,
  FrontendTransferData,
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

interface DataToAssertParam {
  dataToAssert: Buffer;
}

interface ClientStorageParam {
  storageUnderTest: ClientStorage;
}

interface FrontendStorageParam {
  storageUnderTest: FrontendStorage;
}

type ClientTestCase = ClientStorageParam &
  DataToAssertParam & {
    dataToUpload: TransferData;
  };

type FrontendTestCase = FrontendStorageParam &
  DataToAssertParam & {
    dataToUpload: FrontendTransferData;
  };

type MultipartClientTestCase = ClientStorageParam &
  DataToAssertParam & {
    dataToUpload: MultipartUploadData;
  };

type MultipartFrontendTestCase = FrontendStorageParam &
  DataToAssertParam & {
    dataToUpload: FrontendMultipartUploadData;
  };

export type TestCase = ClientTestCase | FrontendTestCase;
export type MultipartTestCase =
  | MultipartFrontendTestCase
  | MultipartClientTestCase;

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
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-from-buffer-to-url`
  );
  return testUploadToUrl({
    storageUnderTest,
    dataToUpload: buffer,
    dataToAssert: buffer,
  });
}

export async function testUploadFromStreamToUrl(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-from-stream-to-url`;
  const stream = await getTestStream(data);
  return testUploadToUrl({
    storageUnderTest,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testUploadWithRelativeDirFromBufferToUrl(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-from-buffer-to-url-relative-dir`
  );
  return testUploadToUrlWithRelativeDir({
    storageUnderTest,
    dataToUpload: buffer,
    dataToAssert: buffer,
  });
}

export async function testUploadWithRelativeDirFromStreamToUrl(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-from-stream-to-url-relative-dir`;
  const stream = await getTestStream(data);
  return testUploadToUrlWithRelativeDir({
    storageUnderTest,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testUploadWithMetadataFromBufferToUrl(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-from-buffer-to-url-metadata`
  );
  return testUploadToUrlWithMetadata({
    storageUnderTest,
    dataToUpload: buffer,
    dataToAssert: buffer,
  });
}

export async function testUploadWithMetadataFromStreamToUrl(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-from-stream-to-url-metadata`;
  const stream = await getTestStream(data);
  return testUploadToUrlWithMetadata({
    storageUnderTest,
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
  await callUrlUpload(params, uploadUrl, undefined);

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
  await callUrlUpload(params, uploadUrl, undefined);

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
  await callUrlUpload(params, uploadUrl, metadata);

  await checkUploadedFileValidity(reference, params.dataToAssert);
  await queryAndAssertMetadata(reference, metadata);
}

export async function testUploadFromBufferWithConfig(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-from-buffer-with-config`
  );
  return testUploadWithConfig({
    storageUnderTest,
    dataToUpload: buffer,
    dataToAssert: buffer,
  });
}

export async function testUploadFromStreamWithConfig(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testUploadWithConfig({
    storageUnderTest,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testUploadWithRelativeDirFromBufferWithConfig(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-buffer-with-config`
  );
  return testUploadWithRelativeDirWithConfig({
    storageUnderTest,
    dataToUpload: buffer,
    dataToAssert: buffer,
  });
}

export async function testUploadWithRelativeDirFromStreamWithConfig(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testUploadWithRelativeDirWithConfig({
    storageUnderTest,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testUploadWithMetadataFromBufferWithConfig(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const buffer = Buffer.from(
    `${storageUnderTest.constructor.name}-test-upload-with-metadata-from-buffer-with-config`
  );
  return testUploadWithMetadataWithConfig({
    storageUnderTest,
    dataToUpload: buffer,
    dataToAssert: buffer,
  });
}

export async function testUploadWithMetadataFromStreamWithConfig(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-metadata-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testUploadWithMetadataWithConfig({
    storageUnderTest,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testUploadWithConfig(params: TestCase): Promise<void> {
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
  await callConfigUpload(params, reference, uploadConfig, undefined);

  await checkUploadedFileValidity(reference, params.dataToAssert);
}

export async function testUploadWithRelativeDirWithConfig(
  params: TestCase
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
  await callConfigUpload(params, reference, uploadConfig, undefined);

  await checkUploadedFileValidity(reference, params.dataToAssert);
}

export async function testUploadWithMetadataWithConfig(
  params: TestCase
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
  await callConfigUpload(params, reference, uploadConfig, metadata);

  await checkUploadedFileValidity(reference, params.dataToAssert);
  await queryAndAssertMetadata(reference, metadata);
}

export async function testMultipartUploadFromStream(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testMultipartUpload({
    storageUnderTest,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testMultipartUploadWithRelativeDirFromStream(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testMultipartUploadWithRelativeDir({
    storageUnderTest,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
  });
}

export async function testMultipartUploadWithMetadataFromStream(
  storageUnderTest: FrontendStorage | ClientStorage
): Promise<void> {
  const data = `${storageUnderTest.constructor.name}-test-upload-with-relative-dir-from-stream-with-config`;
  const stream = await getTestStream(data);
  return testMultipartUploadWithMetadata({
    storageUnderTest,
    dataToUpload: stream,
    dataToAssert: Buffer.from(data),
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

  const uploadConfig = await serverStorage.getUploadConfig({
    baseDirectory: testBaseDirectory.baseDirectory,
  });
  await callUploadInMultipleParts(params, reference, uploadConfig, undefined);

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

  const uploadConfig = await serverStorage.getUploadConfig({
    baseDirectory: testBaseDirectory.baseDirectory,
  });
  await callUploadInMultipleParts(params, reference, uploadConfig, undefined);

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

  const uploadConfig = await serverStorage.getUploadConfig({
    baseDirectory: testBaseDirectory.baseDirectory,
  });
  await callUploadInMultipleParts(params, reference, uploadConfig, metadata);

  await checkUploadedFileValidity(reference, params.dataToAssert);
  await queryAndAssertMetadata(reference, metadata);
}

function isClientTestCase(
  testCase: TestCase | MultipartTestCase
): testCase is ClientTestCase | MultipartClientTestCase {
  return testCase.storageUnderTest instanceof ClientStorage;
}

function isFrontendTestCase(
  testCase: TestCase | MultipartTestCase
): testCase is FrontendTestCase | MultipartFrontendTestCase {
  return testCase.storageUnderTest instanceof FrontendStorage;
}

async function callUrlUpload(
  params: TestCase,
  url: string,
  metadata: Metadata | undefined
): Promise<void> {
  if (isClientTestCase(params)) {
    return params.storageUnderTest.upload({
      data: params.dataToUpload,
      url,
      metadata,
    });
  } else if (isFrontendTestCase(params)) {
    return params.storageUnderTest.upload({
      data: params.dataToUpload,
      url,
      metadata,
    });
  } else {
    throw new Error("Invalid test case type.");
  }
}

async function callConfigUpload(
  params: TestCase,
  reference: ObjectReference,
  transferConfig: TransferConfig,
  metadata: Metadata | undefined
): Promise<void> {
  if (isClientTestCase(params)) {
    return params.storageUnderTest.upload({
      data: params.dataToUpload,
      reference,
      transferConfig,
      metadata,
    });
  } else if (isFrontendTestCase(params)) {
    return params.storageUnderTest.upload({
      data: params.dataToUpload,
      reference,
      transferConfig,
      metadata,
    });
  } else {
    throw new Error("Invalid test case type.");
  }
}

async function callUploadInMultipleParts(
  params: MultipartTestCase,
  reference: ObjectReference,
  transferConfig: TransferConfig,
  metadata: Metadata | undefined
): Promise<void> {
  if (isClientTestCase(params)) {
    return params.storageUnderTest.uploadInMultipleParts({
      data: params.dataToUpload,
      reference,
      transferConfig,
      options: { metadata },
    });
  } else if (isFrontendTestCase(params)) {
    return params.storageUnderTest.uploadInMultipleParts({
      data: params.dataToUpload,
      reference,
      transferConfig,
      options: { metadata },
    });
  } else {
    throw new Error("Invalid test case type.");
  }
}
