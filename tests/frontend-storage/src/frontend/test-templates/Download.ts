/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  FrontendTransferType,
  ObjectReference,
} from "@itwin/object-storage-core/lib/frontend";

import {
  assertArrayBuffer,
  assertReadableStream,
  stringToArrayBuffer,
} from "../Helpers";
import { InputMethod, TestCase } from "../Interfaces";

export async function testDownload(
  test: TestCase,
  transferType: FrontendTransferType,
  inputMethod: InputMethod
): Promise<void> {
  const testData = `test-download-to-${transferType}-using-${inputMethod}`;
  const testDataBuffer = stringToArrayBuffer(testData);

  const directory = await test.directoryManager.createNew();
  const reference: ObjectReference = {
    baseDirectory: directory.baseDirectory,
    objectName: testData,
  };
  await test.serverStorage.upload({ data: testData, reference });

  switch (inputMethod) {
    case "url":
      const url = await test.serverStorage.getDownloadUrl({ reference });
      switch (transferType) {
        case "buffer":
          const responseBuffer = await test.frontendStorage.download({
            url,
            transferType,
          });
          assertArrayBuffer(responseBuffer, testDataBuffer);
          break;
        case "stream":
          const responseStream = await test.frontendStorage.download({
            url,
            transferType,
          });
          await assertReadableStream(responseStream, testDataBuffer);
          return;

        default:
          throw new Error(
            `Missing test case for transfer type ${transferType}`
          );
      }
      break;

    case "config":
      const transferConfig = await test.serverStorage.getDownloadConfig({
        directory,
      });
      switch (transferType) {
        case "buffer":
          const responseBuffer = await test.frontendStorage.download({
            reference,
            transferConfig,
            transferType,
          });
          assertArrayBuffer(responseBuffer, testDataBuffer);
          break;
        case "stream":
          const responseStream = await test.frontendStorage.download({
            reference,
            transferConfig,
            transferType,
          });
          await assertReadableStream(responseStream, testDataBuffer);
          break;

        default:
          throw new Error(
            `Missing test case for transfer type ${transferType}`
          );
      }
      break;

    default:
      throw new Error("testDownload(): invalid inputType parameter");
  }
}
