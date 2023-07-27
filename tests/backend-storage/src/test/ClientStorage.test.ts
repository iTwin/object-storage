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
  DirectoryTransferConfigInput,
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
import {
  assertLocalFile,
  assertQueriedObjectsList,
  createObjectsReferences,
  TestRemoteDirectory,
} from "./utils";

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
    const uploadTestCases = [
      {
        transferConfigType: serverStorage.getUploadConfig.name,
        getTransferConfigCallback: (directory: string) =>
          serverStorage.getUploadConfig({ baseDirectory: directory }),
      },
      {
        transferConfigType: serverStorage.getDirectoryAccessConfig.name,
        getTransferConfigCallback: (directory: string) =>
          serverStorage.getDirectoryAccessConfig({ baseDirectory: directory }),
      },
    ];

    for (const testCase of uploadTestCases) {
      describe(`${clientStorage.upload.name}() & ${testCase.transferConfigType}()`, () => {
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
            testCase.getTransferConfigCallback
          );
        });

        it(`should upload a file from stream using transfer config`, async () => {
          await testUploadFromStreamWithConfig(
            clientStorage,
            testCase.getTransferConfigCallback
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
            getTransferConfigCallback: testCase.getTransferConfigCallback,
          });
        });

        it(`should upload a file with relative directory from buffer using transfer config`, async () => {
          await testUploadWithRelativeDirFromBufferWithConfig(
            clientStorage,
            testCase.getTransferConfigCallback
          );
        });

        it(`should upload a file with relative directory from stream using transfer config`, async () => {
          await testUploadWithRelativeDirFromStreamWithConfig(
            clientStorage,
            testCase.getTransferConfigCallback
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
            getTransferConfigCallback: testCase.getTransferConfigCallback,
          });
        });

        it(`should upload a file from buffer with metadata using transfer config`, async () => {
          await testUploadWithMetadataFromBufferWithConfig(
            clientStorage,
            testCase.getTransferConfigCallback
          );
        });

        it(`should upload a file from stream with metadata using transfer config`, async () => {
          await testUploadWithMetadataFromStreamWithConfig(
            clientStorage,
            testCase.getTransferConfigCallback
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
            getTransferConfigCallback: testCase.getTransferConfigCallback,
          });
        });
      });

      describe(`${clientStorage.uploadInMultipleParts.name}() & ${testCase.transferConfigType}()`, () => {
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
            testCase.getTransferConfigCallback
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
            getTransferConfigCallback: testCase.getTransferConfigCallback,
          });
        });

        it(`should upload a file with relative directory from stream in multiple parts`, async () => {
          await testMultipartUploadWithRelativeDirFromStream(
            clientStorage,
            testCase.getTransferConfigCallback
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
            getTransferConfigCallback: testCase.getTransferConfigCallback,
          });
        });

        it(`should upload a file from stream with metadata in multiple parts`, async () => {
          await testMultipartUploadWithMetadataFromStream(
            clientStorage,
            testCase.getTransferConfigCallback
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
            getTransferConfigCallback: testCase.getTransferConfigCallback,
          });
        });
      });
    }

    const downloadTestCases = [
      {
        transferConfigType: serverStorage.getDownloadConfig.name,
        getTransferConfigCallback: (directory: BaseDirectory) =>
          serverStorage.getDownloadConfig(directory),
      },
      {
        transferConfigType: serverStorage.getDirectoryAccessConfig.name,
        getTransferConfigCallback: (directory: BaseDirectory) =>
          serverStorage.getDirectoryAccessConfig(directory),
      },
    ];

    for (const testCase of downloadTestCases) {
      describe(`${clientStorage.download.name}() & ${testCase.transferConfigType}()`, () => {
        it(`should download a file to buffer using transfer config`, async () => {
          await testDownloadToBufferWithConfig(
            clientStorage,
            testCase.getTransferConfigCallback
          );
        });

        it(`should download a file to stream using transfer config`, async () => {
          await testDownloadToStreamWithConfig(
            clientStorage,
            testCase.getTransferConfigCallback
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

          const downloadConfig = await testCase.getTransferConfigCallback(
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

          const downloadConfig = await testCase.getTransferConfigCallback(
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

    describe(`${clientStorage.deleteObject.name}() & ${serverStorage.getDirectoryAccessConfig.name}()`, () => {
      it(`should delete object using transfer config`, async () => {
        const contentBuffer = Buffer.from("test-delete-object-with-config");
        const testDirectory: TestRemoteDirectory =
          await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "test-delete-object-with-config.txt" },
          contentBuffer,
          undefined
        );

        expect(await serverStorage.objectExists(uploadedFile)).to.be.true;
        const transferConfig = await serverStorage.getDirectoryAccessConfig(
          testDirectory.baseDirectory
        );

        await clientStorage.deleteObject({
          reference: uploadedFile,
          transferConfig: transferConfig,
        });

        expect(await serverStorage.objectExists(uploadedFile)).to.be.false;
      });
    });

    describe(`${clientStorage.listObjects.name}() & ${serverStorage.getDirectoryAccessConfig.name}()`, () => {
      it(`should list objects using transfer config`, async () => {
        const testDirectory: TestRemoteDirectory =
          await testDirectoryManager.createNew();

        const references = await createObjectsReferences(testDirectory, 3);
        const transferConfig = await serverStorage.getDirectoryAccessConfig(
          testDirectory.baseDirectory
        );

        const queriedObjects: ObjectReference[] =
          await clientStorage.listObjects({
            baseDirectory: testDirectory.baseDirectory,
            transferConfig: transferConfig,
          });

        assertQueriedObjectsList(queriedObjects, references);
      });
    });

    describe(`${clientStorage.getListObjectsPagedIterator.name}() & ${serverStorage.getDirectoryAccessConfig.name}()`, () => {
      it("Should list objects without exceeding maxPageSize per page.", async () => {
        const testDirectory: TestRemoteDirectory =
          await testDirectoryManager.createNew();
        await createObjectsReferences(testDirectory, 3);
        const maxPageSize = 2;
        const transferConfig = await serverStorage.getDirectoryAccessConfig(
          testDirectory.baseDirectory
        );
        const input: DirectoryTransferConfigInput = {
          baseDirectory: testDirectory.baseDirectory,
          transferConfig: transferConfig,
        };

        const queriedObjectsIterator =
          clientStorage.getListObjectsPagedIterator(input, maxPageSize);
        for await (const entityPage of queriedObjectsIterator)
          expect(entityPage.length).to.be.lte(maxPageSize);
      });

      it("Should list created objects without duplicates", async () => {
        const testDirectory: TestRemoteDirectory =
          await testDirectoryManager.createNew();
        const createdObjects = 3;
        const references: ObjectReference[] = await createObjectsReferences(
          testDirectory,
          createdObjects
        );

        const uniqueObjects = new Set<string>();
        let queriedObjects: ObjectReference[] = [];
        const maxPageSize = 2;
        const transferConfig = await serverStorage.getDirectoryAccessConfig(
          testDirectory.baseDirectory
        );
        const input: DirectoryTransferConfigInput = {
          baseDirectory: testDirectory.baseDirectory,
          transferConfig: transferConfig,
        };

        const queriedObjectsIterator =
          clientStorage.getListObjectsPagedIterator(input, maxPageSize);

        for await (const entityPage of queriedObjectsIterator) {
          entityPage.forEach((entry: ObjectReference) =>
            uniqueObjects.add(entry.objectName)
          );
          queriedObjects = [...queriedObjects, ...entityPage];
        }
        expect(uniqueObjects.size).to.be.gte(createdObjects);

        for (const reference of references) {
          const queriedObject = queriedObjects.find(
            (ref) => ref.objectName === reference.objectName
          );
          expect(queriedObject).to.be.deep.equal(reference);
        }
        expect(queriedObjects.length).to.be.equal(uniqueObjects.size);
      });
    });
  });
});
