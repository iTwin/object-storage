/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import { AbortController } from "abort-controller";
import { expect } from "chai";

import {
  BaseDirectory,
  ClientStorage,
  GenericAbortSignal,
  Metadata,
  MultipartUploadData,
  ObjectReference,
  TransferConfig,
  TransferData,
  TransferProgress,
  TransferProgressCallback,
} from "@itwin/object-storage-core";

import { TestRemoteDirectory } from "../../utils";
import { config } from "../Config";
import { testDirectoryManager, testLocalFileManager } from "../Global.test";
import {
  checkUploadedFileValidity,
  queryAndAssertMetadata,
} from "../utils/Helpers";

const { serverStorage, storageType } = config;

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
    storageType: storageType,
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
    storageType: storageType,
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
    storageType: storageType,
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

export interface UploadTransferOptionsTestCase {
  testedStorage: ClientStorage;
  uploadMethod: "url" | "config" | "multipart";
  getTransferConfigCallback?: (directory: string) => Promise<TransferConfig>;
}

type Uploader = (
  data: TransferData,
  options: {
    abortSignal?: GenericAbortSignal;
    onProgress?: TransferProgressCallback;
    metadata?: Metadata;
  }
) => Promise<void>;

async function prepareUpload(
  params: UploadTransferOptionsTestCase
): Promise<{ reference: ObjectReference; upload: Uploader }> {
  const { testedStorage, uploadMethod, getTransferConfigCallback } = params;
  const testBaseDirectory: BaseDirectory = (
    await testDirectoryManager.createNew()
  ).baseDirectory;
  const reference: ObjectReference = {
    baseDirectory: testBaseDirectory.baseDirectory,
    objectName: "test-upload-transfer-options",
  };

  if (uploadMethod === "url") {
    const url = await serverStorage.getUploadUrl(reference);
    return {
      reference,
      upload: async (data, options) =>
        testedStorage.upload({ storageType, url, data, ...options }),
    };
  }

  const transferConfig = await getTransferConfigCallback!(
    reference.baseDirectory
  );
  return {
    reference,
    upload: async (data, { metadata, ...options }) =>
      uploadMethod === "config"
        ? testedStorage.upload({
            reference,
            transferConfig,
            data,
            metadata,
            ...options,
          })
        : testedStorage.uploadInMultipleParts({
            reference,
            transferConfig,
            data: data as MultipartUploadData,
            options: { metadata },
            ...options,
          }),
  };
}

async function getUploadData(
  params: UploadTransferOptionsTestCase,
  content: Buffer
): Promise<TransferData> {
  // Multipart upload does not accept buffers.
  return params.uploadMethod === "multipart"
    ? testLocalFileManager.createAndWriteFile("test-upload-abort.txt", content)
    : content;
}

export async function testUploadWithAbortedSignal(
  params: UploadTransferOptionsTestCase
): Promise<void> {
  const { reference, upload } = await prepareUpload(params);
  const data = await getUploadData(params, Buffer.from("test-upload-abort"));
  const abortController = new AbortController();
  abortController.abort();

  await expect(
    upload(data, { abortSignal: abortController.signal })
  ).to.eventually.be.rejected.and.have.property("name", "AbortError");
  expect(await serverStorage.objectExists(reference)).to.be.false;
}

export async function testUploadCancel(
  params: UploadTransferOptionsTestCase
): Promise<void> {
  const { upload } = await prepareUpload(params);
  const data = await getUploadData(params, Buffer.alloc(1024 * 1024, "a"));
  const abortController = new AbortController();

  const uploadPromise = upload(data, { abortSignal: abortController.signal });
  abortController.abort();

  await expect(uploadPromise).to.eventually.be.rejected.and.have.property(
    "name",
    "AbortError"
  );
}

export async function testUploadProgress(
  params: UploadTransferOptionsTestCase & { dataType: "buffer" | "path" }
): Promise<void> {
  const { reference, upload } = await prepareUpload(params);
  const content = Buffer.alloc(256 * 1024, "a");
  const data =
    params.dataType === "buffer"
      ? content
      : await testLocalFileManager.createAndWriteFile(
          "test-upload-progress.txt",
          content
        );
  const events: TransferProgress[] = [];

  await upload(data, { onProgress: (progress) => events.push(progress) });

  expect(events).to.not.be.empty;
  events.forEach((event) =>
    expect(event.loadedBytes).to.be.at.most(content.byteLength)
  );
  expect(events[events.length - 1]).to.deep.equal({
    loadedBytes: content.byteLength,
    totalBytes: content.byteLength,
  });
  await checkUploadedFileValidity(reference, content);
}

/**
 * Some clients upload differently when given a signal (for example, Google
 * streams the data through `createWriteStream`), so a successful upload with
 * a signal that is never aborted is checked separately.
 */
export async function testUploadWithSignal(
  params: UploadTransferOptionsTestCase & {
    dataType: "buffer" | "path" | "stream";
  }
): Promise<void> {
  const { reference, upload } = await prepareUpload(params);
  const content = Buffer.alloc(256 * 1024, "a");
  const metadata: Metadata = { test: "test-metadata" };
  let data: TransferData = content;
  if (params.dataType !== "buffer") {
    const filePath = await testLocalFileManager.createAndWriteFile(
      "test-upload-with-signal.txt",
      content
    );
    data = params.dataType === "path" ? filePath : createReadStream(filePath);
  }
  const events: TransferProgress[] = [];

  await upload(data, {
    abortSignal: new AbortController().signal,
    onProgress: (progress) => events.push(progress),
    metadata,
  });

  expect(events).to.not.be.empty;
  expect(events[events.length - 1].loadedBytes).to.equal(content.byteLength);
  await checkUploadedFileValidity(reference, content);
  await queryAndAssertMetadata(reference, metadata);
}
