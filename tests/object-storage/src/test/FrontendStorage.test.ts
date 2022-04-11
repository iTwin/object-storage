/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientStorage } from "@itwin/object-storage-core";
import { testDownloadFromUrlToBuffer, testDownloadFromUrlToStream, testDownloadToBufferWithConfig, testDownloadToStreamWithConfig } from "./client-storage/DownloadTests";
import { testMultipartUploadFromStream, testMultipartUploadWithMetadataFromStream, testMultipartUploadWithRelativeDirFromStream, testUploadFromBufferToUrl, testUploadFromBufferWithConfig, testUploadFromStreamToUrl, testUploadFromStreamWithConfig, testUploadWithMetadataFromBufferToUrl, testUploadWithMetadataFromBufferWithConfig, testUploadWithMetadataFromStreamToUrl, testUploadWithMetadataFromStreamWithConfig, testUploadWithRelativeDirFromBufferToUrl, testUploadWithRelativeDirFromBufferWithConfig, testUploadWithRelativeDirFromStreamToUrl, testUploadWithRelativeDirFromStreamWithConfig } from "./client-storage/UploadTests";
import { config } from "./Config";

const { frontendStorage, serverStorage } = config;

describe(`${ClientStorage.name}: ${frontendStorage.constructor.name}`, () => { // TODO: ClientStorage.name
  describe("PresignedUrlProvider", () => {
    describe(`${frontendStorage.upload.name}() & ${serverStorage.getUploadUrl.name}()`, () => {
      it("should upload a file from buffer to URL", async () => {
        await testUploadFromBufferToUrl(frontendStorage);
      });

      it("should upload a file from stream to URL", async () => {
        await testUploadFromStreamToUrl(frontendStorage);
      });

      it("should upload a file with relative dir from buffer to URL", async () => {
        await testUploadWithRelativeDirFromBufferToUrl(frontendStorage);
      });

      it("should upload a file with relative dir from stream to URL", async () => {
        await testUploadWithRelativeDirFromStreamToUrl(frontendStorage);
      });

      it("should upload a file with metadata from buffer to URL", async () => {
        await testUploadWithMetadataFromBufferToUrl(frontendStorage);
      });

      it("should upload a file with metadata from stream to URL", async () => {
        await testUploadWithMetadataFromStreamToUrl(frontendStorage);
      });
    });

    describe(`${frontendStorage.download.name}() & ${serverStorage.getDownloadUrl.name}()`, () => {
      it(`should download a file to buffer from URL`, async () => {
        await testDownloadFromUrlToBuffer(frontendStorage);
      });

      it(`should download a file to stream from URL`, async () => {
        await testDownloadFromUrlToStream(frontendStorage);
      });
    });
  });

  describe("TransferConfigProvider", () => {
    describe(`${frontendStorage.upload.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
      it(`should upload a file from buffer using transfer config`, async () => {
        await testUploadFromBufferWithConfig(frontendStorage);
      });

      it(`should upload a file from stream using transfer config`, async () => {
        await testUploadFromStreamWithConfig(frontendStorage);
      });

      it(`should upload a file with relative directory from buffer using transfer config`, async () => {
        await testUploadWithRelativeDirFromBufferWithConfig(frontendStorage);
      });

      it(`should upload a file with relative directory from stream using transfer config`, async () => {
        await testUploadWithRelativeDirFromStreamWithConfig(frontendStorage);
      });

      it(`should upload a file from buffer with metadata using transfer config`, async () => {
        await testUploadWithMetadataFromBufferWithConfig(frontendStorage);
      });

      it(`should upload a file from stream with metadata using transfer config`, async () => {
        await testUploadWithMetadataFromStreamWithConfig(frontendStorage);
      });
    });

    describe(`${frontendStorage.uploadInMultipleParts.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
      it(`should upload a file from stream in multiple parts`, async () => {
        await testMultipartUploadFromStream(frontendStorage);
      });

      it(`should upload a file with relative directory from stream in multiple parts`, async () => {
        await testMultipartUploadWithRelativeDirFromStream(frontendStorage);
      });

      it(`should upload a file from stream with metadata in multiple parts`, async () => {
        await testMultipartUploadWithMetadataFromStream(frontendStorage);
      });
    });

    describe(`${frontendStorage.download.name}() & ${serverStorage.getDownloadConfig.name}()`, () => {
      it(`should download a file to buffer using transfer config`, async () => {
        await testDownloadToBufferWithConfig(frontendStorage);
      });

      it(`should download a file to stream using transfer config`, async () => {
        await testDownloadToStreamWithConfig(frontendStorage);
      });
    });
  });
});
