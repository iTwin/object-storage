/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomUUID } from "crypto";
import { promises } from "fs";

import { expect } from "chai";

import {
  ClientStorage,
  Metadata,
  ObjectDirectory,
  ObjectReference,
  TransferData,
} from "@itwin/object-storage-core";

import { config } from "./Config";

const { serverStorage } = config;

export async function checkUploadedFileValidity(
  reference: ObjectReference,
  contentBuffer: Buffer,
  metadata: Metadata
): Promise<void> {
  expect(await serverStorage.exists(reference)).to.be.true;

  const downloadedBuffer = await serverStorage.download(reference, "buffer");
  expect(downloadedBuffer.equals(contentBuffer)).to.be.true;

  const { metadata: _metadata } = await serverStorage.getObjectProperties(
    reference
  );
  expect(_metadata).to.eql(metadata);
}

export function testPresignedUrlUpload(
  contentBuffer: Buffer,
  fileToUploadPath: string,
  clientStorage: ClientStorage,
  testDirectoryManager: TestDirectoryManager,
  uploadTestCases: {
    caseName: string;
    objectName: string;
    dataCallback: () => TransferData;
    rejectedWith?: Parameters<Chai.PromisedThrow>;
  }[]
): void {
  let testDirectory: ObjectDirectory;

  before(async () => {
    testDirectory = await testDirectoryManager.createNewDirectory();
    await promises.writeFile(fileToUploadPath, contentBuffer);
  });

  after(async () => {
    const deletePromises = uploadTestCases.map(async (testCase) =>
      serverStorage.delete({
        ...testDirectory,
        objectName: testCase.objectName,
      })
    );

    await Promise.all([...deletePromises, promises.unlink(fileToUploadPath)]);
  });

  for (const testCase of uploadTestCases) {
    const { caseName, objectName, dataCallback, rejectedWith } = testCase;
    it(`should upload a file from ${caseName} with metadata to URL`, async () => {
      const reference = {
        ...testDirectory,
        objectName,
      };

      const uploadUrl = await serverStorage.getUploadUrl(reference);

      const metadata = {
        test: "test-metadata",
      };
      const uploadPromise = clientStorage.upload({
        url: uploadUrl,
        data: dataCallback(),
        metadata,
      });

      if (rejectedWith !== undefined)
        await expect(uploadPromise).to.eventually.be.rejectedWith(
          ...rejectedWith
        );
      else await expect(uploadPromise).to.eventually.be.fulfilled;

      await checkUploadedFileValidity(reference, contentBuffer, metadata);
    });
  }
}

export class TestDirectoryManager {
  private _createdDirectories: ObjectDirectory[] = [];

  public async createNewDirectory(): Promise<ObjectDirectory> {
    const newDirectory: ObjectDirectory = {
      baseDirectory: randomUUID(),
      relativeDirectory: "foobar",
    };
    this._createdDirectories.push(newDirectory);

    await serverStorage.create(newDirectory);

    return newDirectory;
  }

  public async purgeCreatedDirectories(): Promise<void> {
    for (const directoryToDelete of this._createdDirectories)
      await serverStorage.delete(directoryToDelete);
    this._createdDirectories = [];
  }
}
