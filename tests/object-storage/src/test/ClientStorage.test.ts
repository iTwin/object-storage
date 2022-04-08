/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import * as path from "path";

import { use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {
  BaseDirectory,
  ClientStorage,
  Metadata,
  ObjectReference,
} from "@itwin/object-storage-core";

import { config } from "./Config";
import { testDirectoryManager, testLocalFileManager } from "./Global.test";
import {
  assertBuffer,
  assertLocalFile,
  assertStream,
  checkUploadedFileValidity,
  queryAndAssertMetadata,
  TestDirectory,
} from "./Helpers";
import { testUploadFromBufferToUrl, testUploadFromStreamToUrl, testUploadWithRelativeDirFromBufferToUrl, testUploadWithRelativeDirFromStreamToUrl, testUploadWithMetadataFromBufferToUrl, testUploadWithMetadataFromStreamToUrl, testUploadToUrl, testUploadToUrlWithRelativeDir, testUploadToUrlWithMetadata, testUploadFromBufferWithConfig, testUploadFromStreamWithConfig, testUploadWithRelativeDirFromBufferWithConfig, testUploadWithRelativeDirFromStreamWithConfig, testUploadWithMetadataFromBufferWithConfig, testUploadWithMetadataFromStreamWithConfig, testUploadWithConfig, testUploadWithRelativeDirWithConfig, testUploadWithMetadataWithConfig, testMultipartUploadFromStream, testMultipartUploadWithRelativeDirFromStream, testMultipartUploadWithMetadataFromStream } from "./client-storage/UploadTests";
import { testDownloadFromUrlToBuffer, testDownloadFromUrlToStream } from "./client-storage/DownloadTests";

use(chaiAsPromised);

const { clientStorage, serverStorage } = config;


describe(`${ClientStorage.name}: ${clientStorage.constructor.name}`, () => {
  describe("PresignedUrlProvider", () => {
    describe(`${clientStorage.upload.name}() & ${serverStorage.getUploadUrl.name}()`, () => {
      it("should upload a file from buffer to URL", async () => {
        await testUploadFromBufferToUrl(clientStorage);
      });

      it("should upload a file from stream to URL", async () => {
        await testUploadFromStreamToUrl(clientStorage);
      });

      it("should upload a file from path to URL", async () => {
        const contentBuffer = Buffer.from("test-url-upload-content");
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-client-url-upload-metadata.txt",
            contentBuffer
          );
        await testUploadToUrl(clientStorage, fileToUploadPath, contentBuffer);
      });

      it("should upload a file with relative dir from buffer to URL", async () => {
        await testUploadWithRelativeDirFromBufferToUrl(clientStorage);
      });

      it("should upload a file with relative dir from stream to URL", async () => {
        await testUploadWithRelativeDirFromStreamToUrl(clientStorage);
      });

      it("should upload a file with relative dir from path to URL", async () => {
        const contentBuffer = Buffer.from("test-url-upload-content");
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-client-url-upload-metadata.txt",
            contentBuffer
          );
        await testUploadToUrlWithRelativeDir(clientStorage, fileToUploadPath, contentBuffer);
      });

      it("should upload a file with metadata from buffer to URL", async () => {
        await testUploadWithMetadataFromBufferToUrl(clientStorage);
      });

      it("should upload a file with metadata from stream to URL", async () => {
        await testUploadWithMetadataFromStreamToUrl(clientStorage);
      });

      it("should upload a file with metadata dir from path to URL", async () => {
        const contentBuffer = Buffer.from("test-url-upload-content");
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-client-url-upload-metadata.txt",
            contentBuffer
          );
        await testUploadToUrlWithMetadata(clientStorage, fileToUploadPath, contentBuffer);
      });
    });

    describe(`${clientStorage.download.name}() & ${serverStorage.getDownloadUrl.name}()`, () => {
      it(`should download a file to buffer from URL`, async () => {
        await testDownloadFromUrlToBuffer(clientStorage);
      });

      it(`should download a file to stream from URL`, async () => {
        await testDownloadFromUrlToStream(clientStorage);
      });

      it(`should download a file to path from URL`, async () => {
        const contentBuffer = Buffer.from("test-download-from-url-to-path");
        const testDownloasPath: string =
          await testLocalFileManager.getDownloadsDir();
        const testDirectory: TestDirectory =
          await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "file-to-download-from-url.txt" },
          contentBuffer,
          undefined
        );

        const downloadUrl = await serverStorage.getDownloadUrl(uploadedFile);
        const response = await clientStorage.download({
          url: downloadUrl,
          transferType: "local",
          localPath: `${testDownloasPath}/download-url.txt`,
        });

        await assertLocalFile(response, contentBuffer);
      });
    });
  });

  describe("TransferConfigProvider", () => {
    describe(`${clientStorage.upload.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
      it(`should upload a file from buffer using transfer config`, async () => {
        await testUploadFromBufferWithConfig(clientStorage);
      });

      it(`should upload a file from stream using transfer config`, async () => {
        await testUploadFromStreamWithConfig(clientStorage);
      });

      it(`should upload a file from path using transfer config`, async () => {
        const buffer = Buffer.from(`${clientStorage.constructor.name}-test-upload-with-from-file-with-config`);
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-client-url-upload-metadata.txt",
            buffer
          );
        await testUploadWithConfig(clientStorage, fileToUploadPath, buffer);
      });

      it(`should upload a file with relative directory from buffer using transfer config`, async () => {
        await testUploadWithRelativeDirFromBufferWithConfig(clientStorage);
      });

      it(`should upload a file with relative directory from stream using transfer config`, async () => {
        await testUploadWithRelativeDirFromStreamWithConfig(clientStorage);
      });

      it(`should upload a file with relative directory from path using transfer config`, async () => {
        const buffer = Buffer.from(`${clientStorage.constructor.name}-test-upload-with-relative-dir-with-from-file-with-config`);
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-client-url-upload-metadata.txt",
            buffer
          );
        await testUploadWithRelativeDirWithConfig(clientStorage, fileToUploadPath, buffer);
      });

      it(`should upload a file from buffer with metadata using transfer config`, async () => {
        await testUploadWithMetadataFromBufferWithConfig(clientStorage);
      });

      it(`should upload a file from stream with metadata using transfer config`, async () => {
        await testUploadWithMetadataFromStreamWithConfig(clientStorage);
      });

      it(`should upload a file from path with metadata using transfer config`, async () => {
        const buffer = Buffer.from(`${clientStorage.constructor.name}-test-upload-with-metadata-with-from-file-with-config`);
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-client-url-upload-metadata.txt",
            buffer
          );
        await testUploadWithMetadataWithConfig(clientStorage, fileToUploadPath, buffer);
      });
    });

    describe(`${clientStorage.uploadInMultipleParts.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
      const contentBuffer = Buffer.from("test-config-multipart-upload-content");
      const uploadTestCases = [
        {
          caseName: "Stream",
          objectName: "test-multipart-upload-config-stream.txt",
          dataCallback: (sourceFile: string) => createReadStream(sourceFile),
        },
        {
          caseName: "path",
          objectName: "test-multipart-upload-config-local.txt",
          dataCallback: (sourceFile: string) => sourceFile,
        },
      ];

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;

        it(`should upload a file from ${caseName} using transfer config`, async () => {
          const fileToUploadPath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-client-config-multipart-upload.txt",
              contentBuffer
            );
          const testBaseDirectory: BaseDirectory = (
            await testDirectoryManager.createNew()
          ).baseDirectory;
          const reference: ObjectReference = {
            baseDirectory: testBaseDirectory.baseDirectory,
            objectName,
          };

          const uploadConfig = await serverStorage.getUploadConfig({
            baseDirectory: testBaseDirectory.baseDirectory,
          });
          await clientStorage.uploadInMultipleParts({
            data: dataCallback(fileToUploadPath),
            reference,
            transferConfig: uploadConfig,
          });

          await checkUploadedFileValidity(reference, contentBuffer);
        });

        it(`should upload a file with relative directory from ${caseName} using transfer config`, async () => {
          const fileToUploadPath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-client-config-multipart-upload-relative-dir.txt",
              contentBuffer
            );
          const testBaseDirectory: BaseDirectory = (
            await testDirectoryManager.createNew()
          ).baseDirectory;
          const reference: ObjectReference = {
            baseDirectory: testBaseDirectory.baseDirectory,
            relativeDirectory: "relative-1/relative-2",
            objectName,
          };

          const uploadConfig = await serverStorage.getUploadConfig({
            baseDirectory: testBaseDirectory.baseDirectory,
          });
          await clientStorage.uploadInMultipleParts({
            data: dataCallback(fileToUploadPath),
            reference,
            transferConfig: uploadConfig,
          });

          await checkUploadedFileValidity(reference, contentBuffer);
        });

        it(`should upload a file from ${caseName} with metadata using transfer config`, async () => {
          const fileToUploadPath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-client-config-multipart-upload-metadata.txt",
              contentBuffer
            );
          const testBaseDirectory: BaseDirectory = (
            await testDirectoryManager.createNew()
          ).baseDirectory;
          const reference: ObjectReference = {
            baseDirectory: testBaseDirectory.baseDirectory,
            objectName,
          };
          const metadata: Metadata = {
            test: "test-metadata",
          };

          const uploadConfig = await serverStorage.getUploadConfig({
            baseDirectory: testBaseDirectory.baseDirectory,
          });
          await clientStorage.uploadInMultipleParts({
            data: dataCallback(fileToUploadPath),
            reference,
            transferConfig: uploadConfig,
            options: { metadata },
          });

          await checkUploadedFileValidity(reference, contentBuffer);
          await queryAndAssertMetadata(reference, metadata);
        });
      }

      it(`should upload a file from stream in multiple parts`, async () => {
        await testMultipartUploadFromStream(clientStorage);
      });

      it(`should upload a file from path in multiple parts`, async () => {
        const buffer = Buffer.from(`${clientStorage.constructor.name}-test-upload-with-from-file-with-config`);
        const fileToUploadPath: string =
        await testLocalFileManager.createAndWriteFile(
          "test-client-config-multipart-upload-metadata.txt",
          contentBuffer
        );
      });

      it(`should upload a file with relative directory from stream in multiple parts`, async () => {
        await testMultipartUploadWithRelativeDirFromStream(clientStorage);
      });

      it(`should upload a file with relative directory from path in multiple parts`, async () => {

      });

      it(`should upload a file from stream with metadata in multiple parts`, async () => {
        await testMultipartUploadWithMetadataFromStream(clientStorage);
      });

      it(`should upload a file from path with metadata in multiple parts`, async () => { });
    });

    describe(`${clientStorage.download.name}() & ${serverStorage.getDownloadConfig.name}()`, () => {
      const contentBuffer = Buffer.from("test-download-config");

      it(`should download a file to buffer using transfer config`, async () => {
        const testDirectory: TestDirectory =
          await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "file-to-download-with-config.txt" },
          contentBuffer,
          undefined
        );

        const downloadConfig = await serverStorage.getDownloadConfig(
          testDirectory.baseDirectory
        );
        const response = await clientStorage.download({
          reference: uploadedFile,
          transferConfig: downloadConfig,
          transferType: "buffer",
        });

        assertBuffer(response, contentBuffer);
      });

      it(`should download a file to stream using transfer config`, async () => {
        const testDirectory: TestDirectory =
          await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "file-to-download-with-config.txt" },
          contentBuffer,
          undefined
        );

        const downloadConfig = await serverStorage.getDownloadConfig(
          testDirectory.baseDirectory
        );
        const response = await clientStorage.download({
          reference: uploadedFile,
          transferConfig: downloadConfig,
          transferType: "stream",
        });

        await assertStream(response, contentBuffer);
      });

      it(`should download a file to path using transfer config`, async () => {
        const testDownloasPath: string =
          await testLocalFileManager.getDownloadsDir();
        const testDirectory: TestDirectory =
          await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "file-to-download-with-config.txt" },
          contentBuffer,
          undefined
        );

        const downloadConfig = await serverStorage.getDownloadConfig(
          testDirectory.baseDirectory
        );
        const response = await clientStorage.download({
          reference: uploadedFile,
          transferConfig: downloadConfig,
          transferType: "local",
          localPath: path.join(testDownloasPath, "download-config.txt"),
        });

        await assertLocalFile(response, contentBuffer);
      });
    });
  });
});
