/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorage, ObjectReference, TransferConfig, } from "@itwin/object-storage-core/lib/frontend";

import {
  FrontendServerStorageProxy,
  FrontendTestRemoteDirectoryManager,
  TestProps,
  testUploadFromBufferToUrl,
  testUploadFromBufferWithConfig,
  testDownloadFromUrlToBuffer,
  testDownloadFromUrlToStream,
  testDownloadToBufferWithConfig,
  testDownloadToStreamWithConfig,
  testUploadMultipart,
  stringToArrayBuffer,
  stringToReadableStream
} from "../../src/frontend";

const serverBaseUrl: string = (window as any).serverBaseUrl;
const frontendStorage: FrontendStorage = (window as any).frontendStorage;
const serverStorage = new FrontendServerStorageProxy(serverBaseUrl);
const directoryManager = new FrontendTestRemoteDirectoryManager(serverStorage);
const test: TestProps = {
  serverStorage,
  frontendStorage,
  directoryManager
};

describe(`${FrontendStorage.name}: ${frontendStorage.constructor.name}`, () => {
  before(() => {
    cy.visit(`${serverBaseUrl}/index.html`);
  });
  beforeEach(async () => {
    await directoryManager.purgeCreatedDirectories();
  });
  after(async () => {
    await directoryManager.purgeCreatedDirectories();
  });
  
  describe("PresignedUrlProvider", () => {
    describe(`${frontendStorage.upload.name}() & ${serverStorage.getDownloadUrl.name}()`, () => {
      it("should upload a file from buffer to URL", async () => {
        await testUploadFromBufferToUrl(test);
      });
      it("should upload a file with relative dir from buffer to URL", async () => {
        await testUploadFromBufferToUrl(test, { useRelativeDir: true })
      });
      it("should upload a file with metadata from buffer to URL", async () => {
        await testUploadFromBufferToUrl(test, { useMetadata: true })
      });
    });
    describe(`${frontendStorage.download.name}() & ${serverStorage.getDownloadUrl.name}()`, () => {
      it("should download a file to buffer from URL", async () => {
        await testDownloadFromUrlToBuffer(test);
      });
      it(`should download a file to stream from URL`, async () => {
        await testDownloadFromUrlToStream(test);
      });
    });
  });

  describe("TransferConfigProvider", () => {
    describe(`${frontendStorage.upload.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
      it("should upload a file from buffer using transfer config", async () => {
        await testUploadFromBufferWithConfig(test);
      });
      it(`should upload a file with relative directory from buffer using transfer config`, async () => {
        await testUploadFromBufferWithConfig(test, { useRelativeDir: true });
      });
      it(`should upload a file from buffer with metadata using transfer config`, async () => {
        await testUploadFromBufferWithConfig(test, { useMetadata: true });
      });
    });
    describe(`${frontendStorage.uploadInMultipleParts.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
      it(`should upload a file from stream in multiple parts`, async () => {
        await testUploadMultipart(test);
      });
      it(`should upload a file with relative directory from stream in multiple parts`, async () => {
        await testUploadMultipart(test, { useRelativeDir: true });
      });
      it(`should upload a file from stream with metadata in multiple parts`, async () => {
        await testUploadMultipart(test, { useMetadata: true });
      });
    })
    describe(`${frontendStorage.download.name}() & ${serverStorage.getDownloadConfig.name}()`, () => {
      it(`should download a file to buffer using transfer config`, async () => {
        await testDownloadToBufferWithConfig(test);
      });
      it(`should download a file to stream using transfer config`, async () => {
        await testDownloadToStreamWithConfig(test);
      });
    });
  });
});

/**
Common frontend UNIT tests.
Should be moved to a separate frontend-storage-unit package in the future,
but it isn't optimal to do it at the moment.
*/
describe(`${FrontendStorage.name}: ${frontendStorage.constructor.name} (Input validation)`, () => {
  async function testRelativeDirectoryValidation(promise: Promise<any>): Promise<void> {
    let caughtError: unknown | undefined = undefined;
    try { await promise; }
    catch(error) { caughtError = error; }
    expect(caughtError).to.not.be.undefined;
    expect( (caughtError as Error).message ).to.equal("Relative directory cannot contain backslashes.");
  }
  const invalidRelativeDirInput = {
    reference: {
      baseDirectory: "testBaseDirectory",
      relativeDirectory: "testDirectory1\\testDirectory2",
      objectName: "testObjectName"
    } as ObjectReference,
    transferConfig: {
      expiration: new Date(),
      baseUrl: "testBaseUrl"
    } as TransferConfig
  };

  describe(`${frontendStorage.download.name}()`, () => {
    it("should throw if relativeDirectory is invalid (buffer)", async () => {
      await testRelativeDirectoryValidation(
        frontendStorage.download({
          transferType: "buffer",
          ...invalidRelativeDirInput
        })
      );
    });
    
    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(
        frontendStorage.download({
          transferType: "stream",
          ...invalidRelativeDirInput
        })
      );
    });
  });
  describe(`${frontendStorage.upload.name}()`, () => {
    it("should throw if relativeDirectory is invalid (buffer)", async () => {
      await testRelativeDirectoryValidation(
        frontendStorage.upload({
          data: stringToArrayBuffer("testPayload"),
          ...invalidRelativeDirInput
        })
      );
    });
  });
  describe(`${frontendStorage.uploadInMultipleParts.name}()`, () => {
    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(
        frontendStorage.uploadInMultipleParts({
          data: stringToReadableStream("testPayload"),
          ...invalidRelativeDirInput
        })
      );
    });
  });
})
