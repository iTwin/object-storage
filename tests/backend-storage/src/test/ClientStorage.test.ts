/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";

import { AbortController } from "abort-controller";
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {
  BaseDirectory,
  ClientStorage,
  ObjectReference,
} from "@itwin/object-storage-core";

import { config } from "./Config";
import { testDirectoryManager, testLocalFileManager } from "./Global.test";
import {
  testDownloadFromUrlToBuffer,
  testDownloadFromUrlToStream,
  testDownloadToBufferWithConfig,
  testDownloadToStreamWithConfig,
} from "./test-templates/DownloadTests";
import {
  testMultipartUpload,
  testMultipartUploadFromStream,
  testMultipartUploadWithMetadata,
  testMultipartUploadWithMetadataFromStream,
  testMultipartUploadWithRelativeDir,
  testMultipartUploadWithRelativeDirFromStream,
  testUploadFromBufferToUrl,
  testUploadFromBufferWithConfig,
  testUploadFromStreamToUrl,
  testUploadFromStreamWithConfig,
  testUploadToUrl,
  testUploadToUrlWithMetadata,
  testUploadToUrlWithRelativeDir,
  testUploadWithConfig,
  testUploadWithMetadataFromBufferToUrl,
  testUploadWithMetadataFromBufferWithConfig,
  testUploadWithMetadataFromStreamToUrl,
  testUploadWithMetadataFromStreamWithConfig,
  testUploadWithMetadataWithConfig,
  testUploadWithRelativeDirFromBufferToUrl,
  testUploadWithRelativeDirFromBufferWithConfig,
  testUploadWithRelativeDirFromStreamToUrl,
  testUploadWithRelativeDirFromStreamWithConfig,
  testUploadWithRelativeDirWithConfig,
} from "./test-templates/UploadTests";
import { assertLocalFile, TestRemoteDirectory } from "./utils";

use(chaiAsPromised);

const { clientStorage, serverStorage } = config;

describe(`${ClientStorage.name}: ${clientStorage.constructor.name}`, () => {
  describe("PresignedUrlProvider", () => {
    describe(`${clientStorage.upload.name}() & ${serverStorage.getUploadUrl.name}()`, () => {
      it("should fail to upload to URL if specified path contains empty file", async () => {
        const emptyFilePath: string =
          await testLocalFileManager.createAndWriteFile("test-empty-file.txt");

        const uploadPromise = clientStorage.upload({
          url: "test-url",
          data: emptyFilePath,
        });

        await expect(uploadPromise).to.eventually.be.rejectedWith(
          Error,
          "Provided path is an empty file."
        );
      });

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
        await testUploadToUrl({
          testedStorage: clientStorage,
          dataToUpload: fileToUploadPath,
          dataToAssert: contentBuffer,
        });
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
        await testUploadToUrlWithRelativeDir({
          testedStorage: clientStorage,
          dataToUpload: fileToUploadPath,
          dataToAssert: contentBuffer,
        });
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
        await testUploadToUrlWithMetadata({
          testedStorage: clientStorage,
          dataToUpload: fileToUploadPath,
          dataToAssert: contentBuffer,
        });
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
        const testDownloadPath: string =
          await testLocalFileManager.getDownloadsDir();
        const testDirectory: TestRemoteDirectory =
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
          localPath: `${testDownloadPath}/download-url.txt`,
        });

        await assertLocalFile(response, contentBuffer);
      });

      it(`should cancel file download from URL`, async () => {
        const contentBuffer = Buffer.from("test-download-from-url-to-path");
        const testDownloadPath: string =
          await testLocalFileManager.getDownloadsDir();
        const testDirectory: TestRemoteDirectory =
          await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "file-to-download-from-url.txt" },
          contentBuffer,
          undefined
        );

        const downloadUrl = await serverStorage.getDownloadUrl(uploadedFile);
        const abortController = new AbortController();

        const downloadPromise = clientStorage.download({
          url: downloadUrl,
          transferType: "local",
          localPath: `${testDownloadPath}/download-url.txt`,
          abortSignal: abortController.signal,
        });

        abortController.abort();

        let wasAborted = false;
        try {
          await downloadPromise;
        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError")
            wasAborted = true;
        }

        expect(wasAborted).to.be.true;
      });
    });
  });

  describe("TransferConfigProvider", () => {
    const transferConfigTypesForUpload = [
      {
        getConfigFunctionName: serverStorage.getUploadConfig.name,
        getTransferConfigCallback: (directory: string) =>
          serverStorage.getUploadConfig({ baseDirectory: directory }),
      },
      {
        getConfigFunctionName: serverStorage.getDirectoryAccessConfig.name,
        getTransferConfigCallback: (directory: string) =>
          serverStorage.getDirectoryAccessConfig({ baseDirectory: directory }),
      },
    ];

    for (const transferConfigType of transferConfigTypesForUpload) {
      describe(`${clientStorage.upload.name}() & ${transferConfigType.getConfigFunctionName}()`, () => {
        it("should fail to upload with config if specified path contains empty file", async () => {
          const emptyFilePath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-empty-file.txt"
            );

          const uploadPromise = clientStorage.upload({
            data: emptyFilePath,
            reference: {
              baseDirectory: "test-directory",
              objectName: "test-object-name",
            },
            transferConfig: {
              baseUrl: "test-url",
              expiration: new Date(),
            },
          });

          await expect(uploadPromise).to.eventually.be.rejectedWith(
            Error,
            "Provided path is an empty file."
          );
        });

        it(`should upload a file from buffer using transfer config`, async () => {
          await testUploadFromBufferWithConfig(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should upload a file from stream using transfer config`, async () => {
          await testUploadFromStreamWithConfig(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should upload a file from path using transfer config`, async () => {
          const buffer = Buffer.from(
            `${clientStorage.constructor.name}-test-upload-with-from-file-with-config`
          );
          const fileToUploadPath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-client-url-upload-metadata.txt",
              buffer
            );
          await testUploadWithConfig({
            testedStorage: clientStorage,
            dataToUpload: fileToUploadPath,
            dataToAssert: buffer,
            getTransferConfigCallback:
              transferConfigType.getTransferConfigCallback,
          });
        });

        it(`should upload a file with relative directory from buffer using transfer config`, async () => {
          await testUploadWithRelativeDirFromBufferWithConfig(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should upload a file with relative directory from stream using transfer config`, async () => {
          await testUploadWithRelativeDirFromStreamWithConfig(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should upload a file with relative directory from path using transfer config`, async () => {
          const buffer = Buffer.from(
            `${clientStorage.constructor.name}-test-upload-with-relative-dir-with-from-file-with-config`
          );
          const fileToUploadPath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-client-url-upload-metadata.txt",
              buffer
            );
          await testUploadWithRelativeDirWithConfig({
            testedStorage: clientStorage,
            dataToUpload: fileToUploadPath,
            dataToAssert: buffer,
            getTransferConfigCallback:
              transferConfigType.getTransferConfigCallback,
          });
        });

        it(`should upload a file from buffer with metadata using transfer config`, async () => {
          await testUploadWithMetadataFromBufferWithConfig(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should upload a file from stream with metadata using transfer config`, async () => {
          await testUploadWithMetadataFromStreamWithConfig(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should upload a file from path with metadata using transfer config`, async () => {
          const buffer = Buffer.from(
            `${clientStorage.constructor.name}-test-upload-with-metadata-with-from-file-with-config`
          );
          const fileToUploadPath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-client-url-upload-metadata.txt",
              buffer
            );
          await testUploadWithMetadataWithConfig({
            testedStorage: clientStorage,
            dataToUpload: fileToUploadPath,
            dataToAssert: buffer,
            getTransferConfigCallback:
              transferConfigType.getTransferConfigCallback,
          });
        });
      });

      describe(`${clientStorage.uploadInMultipleParts.name}() & ${transferConfigType.getConfigFunctionName}()`, () => {
        it("should fail to upload in multiple parts if specified path contains empty file", async () => {
          const emptyFilePath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-empty-file.txt"
            );

          const uploadPromise = clientStorage.uploadInMultipleParts({
            data: emptyFilePath,
            reference: {
              baseDirectory: "test-directory",
              objectName: "test-object-name",
            },
            transferConfig: {
              baseUrl: "test-url",
              expiration: new Date(),
            },
          });

          await expect(uploadPromise).to.eventually.be.rejectedWith(
            Error,
            "Provided path is an empty file."
          );
        });

        it(`should upload a file from stream in multiple parts`, async () => {
          await testMultipartUploadFromStream(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should upload a file from path in multiple parts`, async () => {
          const buffer = Buffer.from(
            `${clientStorage.constructor.name}-test-multipart-upload-from-file`
          );
          const fileToUploadPath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-client-config-multipart-upload.txt",
              buffer
            );
          await testMultipartUpload({
            testedStorage: clientStorage,
            dataToUpload: fileToUploadPath,
            dataToAssert: buffer,
            getTransferConfigCallback:
              transferConfigType.getTransferConfigCallback,
          });
        });

        it(`should upload a file with relative directory from stream in multiple parts`, async () => {
          await testMultipartUploadWithRelativeDirFromStream(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should upload a file with relative directory from path in multiple parts`, async () => {
          const buffer = Buffer.from(
            `${clientStorage.constructor.name}-test-multipart-upload-with-relative-dir-from-file`
          );
          const fileToUploadPath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-client-config-multipart-upload-relative-dir.txt",
              buffer
            );
          await testMultipartUploadWithRelativeDir({
            testedStorage: clientStorage,
            dataToUpload: fileToUploadPath,
            dataToAssert: buffer,
            getTransferConfigCallback:
              transferConfigType.getTransferConfigCallback,
          });
        });

        it(`should upload a file from stream with metadata in multiple parts`, async () => {
          await testMultipartUploadWithMetadataFromStream(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should upload a file from path with metadata in multiple parts`, async () => {
          const buffer = Buffer.from(
            `${clientStorage.constructor.name}-test-multipart-upload-with-metadata-from-file`
          );
          const fileToUploadPath: string =
            await testLocalFileManager.createAndWriteFile(
              "test-client-config-multipart-upload-metadata.txt",
              buffer
            );
          await testMultipartUploadWithMetadata({
            testedStorage: clientStorage,
            dataToUpload: fileToUploadPath,
            dataToAssert: buffer,
            getTransferConfigCallback:
              transferConfigType.getTransferConfigCallback,
          });
        });
      });
    }

    const transferConfigTypesForDownload = [
      {
        getConfigFunctionName: serverStorage.getDownloadConfig.name,
        getTransferConfigCallback: (directory: BaseDirectory) =>
          serverStorage.getDownloadConfig(directory),
      },
      {
        getConfigFunctionName: serverStorage.getDirectoryAccessConfig.name,
        getTransferConfigCallback: (directory: BaseDirectory) =>
          serverStorage.getDirectoryAccessConfig(directory),
      },
    ];

    for (const transferConfigType of transferConfigTypesForDownload) {
      describe(`${clientStorage.download.name}() & ${transferConfigType.getConfigFunctionName}()`, () => {
        it(`should download a file to buffer using transfer config`, async () => {
          await testDownloadToBufferWithConfig(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should download a file to stream using transfer config`, async () => {
          await testDownloadToStreamWithConfig(
            clientStorage,
            transferConfigType.getTransferConfigCallback
          );
        });

        it(`should download a file to path using transfer config`, async () => {
          const contentBuffer = Buffer.from(
            "test-download-to-path-with-config"
          );
          const testDownloadPath: string =
            await testLocalFileManager.getDownloadsDir();
          const testDirectory: TestRemoteDirectory =
            await testDirectoryManager.createNew();
          const uploadedFile: ObjectReference = await testDirectory.uploadFile(
            { objectName: "file-to-download-with-config.txt" },
            contentBuffer,
            undefined
          );

          const downloadConfig =
            await transferConfigType.getTransferConfigCallback(
              testDirectory.baseDirectory
            );
          const response = await clientStorage.download({
            reference: uploadedFile,
            transferConfig: downloadConfig,
            transferType: "local",
            localPath: path.join(testDownloadPath, "download-config.txt"),
          });

          await assertLocalFile(response, contentBuffer);
        });

        it(`should cancel file download to path using transfer config`, async () => {
          const contentBuffer = Buffer.from(
            "test-download-to-path-with-config"
          );
          const testDownloadPath: string =
            await testLocalFileManager.getDownloadsDir();
          const testDirectory: TestRemoteDirectory =
            await testDirectoryManager.createNew();
          const uploadedFile: ObjectReference = await testDirectory.uploadFile(
            { objectName: "file-to-download-with-config.txt" },
            contentBuffer,
            undefined
          );

          const downloadConfig =
            await transferConfigType.getTransferConfigCallback(
              testDirectory.baseDirectory
            );
          const abortController = new AbortController();

          const downloadPromise = clientStorage.download({
            reference: uploadedFile,
            transferConfig: downloadConfig,
            transferType: "local",
            localPath: path.join(testDownloadPath, "download-config.txt"),
            abortSignal: abortController.signal,
          });

          abortController.abort();

          let wasAborted = false;
          try {
            await downloadPromise;
          } catch (error: unknown) {
            if (error instanceof Error && error.name === "AbortError")
              wasAborted = true;
          }

          expect(wasAborted).to.be.true;
        });
      });
    }
  });
});
