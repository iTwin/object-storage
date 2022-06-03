/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { FrontendTransferData, FrontendTransferType, Metadata, ObjectReference } from "@itwin/object-storage-core";
import { arrayBufferToReadableStream, stringToArrayBuffer } from "../Helpers";
import { TestCase } from "../Interfaces";

export async function testUpload(
  test: TestCase,
  transferType: FrontendTransferType,
  inputMethod: "url" | "config",
  useMetadata: boolean = false,
  useRelativeDir: boolean = false,
) {
  const testData = `test-upload-to-url-from-${transferType}`;
  const testDataBuffer = stringToArrayBuffer(testData);

  const directory = await test.directoryManager.createNew();
  const reference: ObjectReference = {
    baseDirectory: directory.baseDirectory,
    relativeDirectory: useRelativeDir ? "test-relative-1/test-relative-2" : undefined,
    objectName: testData
  };

  const metadata = useMetadata ? {
    "test": "test-metadata"
  } as Metadata : undefined;

  let data: FrontendTransferData;
  switch(transferType) {
    case "buffer":
      data = testDataBuffer;
      break;
    case "stream":
      data = arrayBufferToReadableStream(testDataBuffer);
      break;
    default:
      throw new Error(`Missing test case for transfer type ${transferType}`);
  }

  switch(inputMethod) {
    case "url":
      const url = await test.serverStorage.getUploadUrl({reference});
      await test.frontendStorage.upload({
        url,
        data,
        metadata,
      });
      break;
    case "config":
      const transferConfig = await test.serverStorage.getUploadConfig({directory});
      await test.frontendStorage.upload({
        reference,
        transferConfig,
        data,
        metadata
      });
      break;
    default:
      throw new Error("testDownload(): invalid inputType parameter");
  }
  
  await assertUploadedFile(test, reference, testData, metadata);
}

export async function assertUploadedFile(
  test: TestCase,
  reference: ObjectReference,
  expectedData: string,
  expectedMetadata?: Metadata
) {
  expect(await test.serverStorage.objectExists({reference}), "Object does not exist").to.be.true;
  const downloaded = await test.serverStorage.download({reference});
  expect(downloaded, "Uploaded file is different").to.equal(expectedData);

  if(expectedMetadata) {
    const objectProperties = await test.serverStorage.getObjectProperties({reference});
    expect(objectProperties.metadata, "Mismatching metadata").to.deep.equal(expectedMetadata);
  }
}
