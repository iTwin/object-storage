/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  Metadata,
  ObjectDirectory,
  ObjectReference,
} from "@itwin/object-storage-core/lib/frontend";

import { stringToArrayBuffer, stringToReadableStream } from "../Helpers";

import { TestProps } from "./Interfaces";

export interface UploadTestOptions {
  useRelativeDir?: boolean;
  useMetadata?: boolean;
}

interface UploadTestSetup {
  data: string;
  directory: ObjectDirectory;
  reference: ObjectReference;
  metadata?: Metadata;
}

async function setupUpload(
  testName: string,
  test: TestProps,
  options: UploadTestOptions = {}
): Promise<UploadTestSetup> {
  const data = testName;
  const directory = await test.directoryManager.createNew();
  const reference: ObjectReference = {
    baseDirectory: directory.baseDirectory,
    relativeDirectory: options.useRelativeDir
      ? "test-relative-1/test-relative-2"
      : undefined,
    objectName: `${testName}.txt`,
  };
  const metadata: Metadata | undefined = options.useMetadata
    ? { test: "test-metadata" }
    : undefined;
  return { data, directory, reference, metadata };
}

async function assertUploadedFile(
  test: TestProps,
  reference: ObjectReference,
  expectedData: string,
  expectedMetadata?: Metadata
) {
  expect(
    await test.serverStorage.objectExists({ reference }),
    "Uploaded object does not exist"
  ).to.be.true;
  const uploadedData = await test.serverStorage.download({ reference });
  expect(uploadedData, "Uploaded content is different").to.equal(expectedData);
  if (expectedMetadata) {
    const objectProperties = await test.serverStorage.getObjectProperties({
      reference,
    });
    expect(objectProperties.metadata, "Mismatching metadata").to.deep.equal(
      expectedMetadata
    );
  }
}

export async function testUploadFromBufferToUrl(
  test: TestProps,
  options?: UploadTestOptions
): Promise<void> {
  const { data, reference, metadata } = await setupUpload(
    "test-upload-from-buffer-to-url",
    test,
    options
  );
  const dataBuffer = stringToArrayBuffer(data);
  const url = await test.serverStorage.getUploadUrl({ reference });
  await test.frontendStorage.upload({
    url,
    data: dataBuffer,
    metadata,
  });
  await assertUploadedFile(test, reference, data, metadata);
}

export async function testUploadFromBufferWithConfig(
  test: TestProps,
  options?: UploadTestOptions
): Promise<void> {
  const { data, directory, reference, metadata } = await setupUpload(
    "test-upload-from-buffer-with-config",
    test,
    options
  );
  const dataBuffer = stringToArrayBuffer(data);
  const transferConfig = await test.serverStorage.getUploadConfig({
    directory,
  });
  await test.frontendStorage.upload({
    reference,
    transferConfig,
    data: dataBuffer,
    metadata,
  });
  await assertUploadedFile(test, reference, data, metadata);
}

export async function testUploadMultipart(
  test: TestProps,
  options?: UploadTestOptions
): Promise<void> {
  const { data, directory, reference, metadata } = await setupUpload(
    "test-upload-multipart-from-stream-with-config",
    test,
    options
  );
  const dataStream = stringToReadableStream(data);
  const transferConfig = await test.serverStorage.getUploadConfig({
    directory,
  });
  await test.frontendStorage.uploadInMultipleParts({
    data: dataStream,
    reference,
    transferConfig,
    options: {
      metadata,
    },
  });
  await assertUploadedFile(test, reference, data, metadata);
}
