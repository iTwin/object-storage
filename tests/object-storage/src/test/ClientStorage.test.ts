/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import * as path from "path";

import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { ClientStorage, ObjectReference } from "@itwin/object-storage-core";

import { config } from "./Config";
import {
  assertBuffer,
  assertLocalFile,
  assertStream,
  checkUploadedFileValidity,
  queryAndAssertMetadata,
  TestLocalFileManager,
  TestRemoteDirectoryManager,
} from "./Helpers";

use(chaiAsPromised);

const { clientStorage, serverStorage } = config;

const testDirectoryManager = new TestRemoteDirectoryManager();
const testLocalFileManager = new TestLocalFileManager(
  path.join(process.cwd(), "lib", "tempFiles")
);

beforeEach(async () => {
  await Promise.all([
    testDirectoryManager.purgeCreatedDirectories(),
    testLocalFileManager.purgeCreatedFiles(),
  ]);
});

after(async () => {
  await Promise.all([
    testDirectoryManager.purgeCreatedDirectories(),
    testLocalFileManager.purgeCreatedFiles(),
  ]);
});

describe(`${ClientStorage.name}: ${clientStorage.constructor.name}`, () => {
  describe("PresignedUrlProvider", () => {
    describe(`${clientStorage.upload.name}() & ${serverStorage.getUploadUrl.name}()`, () => {
      const contentBuffer = Buffer.from("test-url-upload-content");

      const uploadTestCases = [
        {
          caseName: "Buffer",
          objectName: "test-upload-url-buffer.txt",
          dataCallback: (_sourcefile: string) => contentBuffer,
        },
        {
          caseName: "Stream",
          objectName: "test-upload-url-stream.txt",
          dataCallback: (sourcefile: string) => createReadStream(sourcefile),
        },
        {
          caseName: "path",
          objectName: "test-upload-url-local.txt",
          dataCallback: (sourcefile: string) => sourcefile,
        },
      ];

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;

        it(`should upload a file from ${caseName} to URL`, async () => {
          const fileToUploadPath =
            await testLocalFileManager.createAndWriteFile(
              "client-url-test.txt",
              contentBuffer
            );

          const testDirectory = await testDirectoryManager.createNew();
          const reference = {
            baseDirectory: testDirectory.baseDirectory.baseDirectory,
            objectName,
          };

          const uploadUrl = await serverStorage.getUploadUrl(reference);
          await clientStorage.upload({
            url: uploadUrl,
            data: dataCallback(fileToUploadPath),
          });
          await checkUploadedFileValidity(reference, contentBuffer);
        });

        it(`should upload a file with relative directory from ${caseName} to URL`, async () => {
          const fileToUploadPath =
            await testLocalFileManager.createAndWriteFile(
              "client-url-test.txt",
              contentBuffer
            );

          const testDirectory = await testDirectoryManager.createNew();
          const reference = {
            baseDirectory: testDirectory.baseDirectory.baseDirectory,
            relativeDirectory: path.join("relative1, relative2"),
            objectName,
          };

          const uploadUrl = await serverStorage.getUploadUrl(reference);
          await clientStorage.upload({
            url: uploadUrl,
            data: dataCallback(fileToUploadPath),
          });
          await checkUploadedFileValidity(reference, contentBuffer);
        });

        it(`should upload a file from ${caseName} with metadata to URL`, async () => {
          const fileToUploadPath =
            await testLocalFileManager.createAndWriteFile(
              "client-url-test.txt",
              contentBuffer
            );

          const testDirectory = await testDirectoryManager.createNew();
          const reference = {
            baseDirectory: testDirectory.baseDirectory.baseDirectory,
            objectName,
          };

          const uploadUrl = await serverStorage.getUploadUrl(reference);

          const metadata = {
            test: "test-metadata",
          };
          const uploadPromise = clientStorage.upload({
            url: uploadUrl,
            data: dataCallback(fileToUploadPath),
            metadata,
          });
          await expect(uploadPromise).to.eventually.be.fulfilled;

          await checkUploadedFileValidity(reference, contentBuffer);
          await queryAndAssertMetadata(reference, metadata);
        });
      }
    });

    describe(`${serverStorage.download.name}() & ${serverStorage.getDownloadUrl.name}()`, () => {
      const contentBuffer = Buffer.from("test-download-url");

      it(`should download a file to buffer from URL`, async () => {
        const testDirectory = await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "file-to-download-from-url.txt" },
          contentBuffer,
          undefined
        );

        const downloadUrl = await serverStorage.getDownloadUrl(uploadedFile);
        const response = await clientStorage.download({
          url: downloadUrl,
          transferType: "buffer",
        });
        assertBuffer(response, contentBuffer);
      });

      it(`should download a file to stream from URL`, async () => {
        const testDirectory = await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "file-to-download-from-url.txt" },
          contentBuffer,
          undefined
        );

        const downloadUrl = await serverStorage.getDownloadUrl(uploadedFile);
        const response = await clientStorage.download({
          url: downloadUrl,
          transferType: "stream",
        });
        await assertStream(response, contentBuffer);
      });

      it(`should download a file to path from URL`, async () => {
        const testDirectory = await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "file-to-download-from-url.txt" },
          contentBuffer,
          undefined
        );
        const testDownloadFolder = await testLocalFileManager.getDownloadsDir();

        const downloadUrl = await serverStorage.getDownloadUrl(uploadedFile);
        const response = await clientStorage.download({
          url: downloadUrl,
          transferType: "local",
          localPath: `${testDownloadFolder}/download-url.txt`,
        });
        await assertLocalFile(response, contentBuffer);
      });
    });
  });

  describe("TransferConfigProvider", () => {
    describe(`${clientStorage.upload.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
      const contentBuffer = Buffer.from("test-config-upload-content");
      const uploadTestCases = [
        {
          caseName: "Buffer",
          objectName: "test-upload-config-buffer.txt",
          dataCallback: (_sourcePath: string) => contentBuffer,
        },
        {
          caseName: "Stream",
          objectName: "test-upload-config-stream.txt",
          dataCallback: (sourcePath: string) => createReadStream(sourcePath),
        },
        {
          caseName: "path",
          objectName: "test-upload-config-local.txt",
          dataCallback: (sourcePath: string) => sourcePath,
        },
      ];

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;
        it(`should upload a file from ${caseName} using transfer config`, async () => {
          const fileToUploadPath =
            await testLocalFileManager.createAndWriteFile(
              "client-config-test.txt",
              contentBuffer
            );

          const testBaseDirectory = (await testDirectoryManager.createNew())
            .baseDirectory;

          const reference = {
            baseDirectory: testBaseDirectory.baseDirectory,
            objectName,
          };

          const uploadConfig = await serverStorage.getUploadConfig({
            baseDirectory: testBaseDirectory.baseDirectory,
          });
          await clientStorage.upload({
            data: dataCallback(fileToUploadPath),
            reference,
            transferConfig: uploadConfig,
          });

          await checkUploadedFileValidity(reference, contentBuffer);
        });

        it(`should upload a file with relative directory from ${caseName} using transfer config`, async () => {
          const fileToUploadPath =
            await testLocalFileManager.createAndWriteFile(
              "client-config-test.txt",
              contentBuffer
            );
          const testBaseDirectory = (await testDirectoryManager.createNew())
            .baseDirectory;
          const reference = {
            baseDirectory: testBaseDirectory.baseDirectory,
            relativeDirectory: path.join("relative1", "relative2"),
            objectName,
          };

          const uploadConfig = await serverStorage.getUploadConfig({
            baseDirectory: testBaseDirectory.baseDirectory,
          });
          await clientStorage.upload({
            data: dataCallback(fileToUploadPath),
            reference,
            transferConfig: uploadConfig,
          });

          await checkUploadedFileValidity(reference, contentBuffer);
        });

        it(`should upload a file from ${caseName} with metadata using transfer config`, async () => {
          const fileToUploadPath =
            await testLocalFileManager.createAndWriteFile(
              "client-config-test.txt",
              contentBuffer
            );
          const testBaseDirectory = (await testDirectoryManager.createNew())
            .baseDirectory;
          const reference = {
            baseDirectory: testBaseDirectory.baseDirectory,
            objectName,
          };
          const metadata = {
            test: "test-metadata",
          };

          const uploadConfig = await serverStorage.getUploadConfig({
            baseDirectory: testBaseDirectory.baseDirectory,
          });
          await clientStorage.upload({
            data: dataCallback(fileToUploadPath),
            reference,
            transferConfig: uploadConfig,
            metadata,
          });

          await checkUploadedFileValidity(reference, contentBuffer);
          await queryAndAssertMetadata(reference, metadata);
        });
      }
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
          const testBaseDirectory = (await testDirectoryManager.createNew())
            .baseDirectory;
          const fileToUploadPath =
            await testLocalFileManager.createAndWriteFile(
              "client-config-test-multipart.txt",
              contentBuffer
            );
          const reference = {
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
          const testBaseDirectory = (await testDirectoryManager.createNew())
            .baseDirectory;
          const fileToUploadPath =
            await testLocalFileManager.createAndWriteFile(
              "client-config-test-multipart.txt",
              contentBuffer
            );
          const reference = {
            baseDirectory: testBaseDirectory.baseDirectory,
            relativeDirectory: path.join("relative1", "relative2"),
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
          const testBaseDirectory = (await testDirectoryManager.createNew())
            .baseDirectory;
          const fileToUploadPath =
            await testLocalFileManager.createAndWriteFile(
              "client-config-test-multipart.txt",
              contentBuffer
            );
          const reference = {
            baseDirectory: testBaseDirectory.baseDirectory,
            objectName,
          };
          const metadata = {
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
    });

    describe(`${clientStorage.download.name}() & ${serverStorage.getDownloadConfig.name}()`, () => {
      const contentBuffer = Buffer.from("test-download-config");

      it(`should download a file to buffer using transfer config`, async () => {
        const testDirectory = await testDirectoryManager.createNew();
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
        const testDirectory = await testDirectoryManager.createNew();
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
        const testDirectory = await testDirectoryManager.createNew();
        const uploadedFile: ObjectReference = await testDirectory.uploadFile(
          { objectName: "file-to-download-with-config.txt" },
          contentBuffer,
          undefined
        );
        const testDownloadFolder = await testLocalFileManager.getDownloadsDir();

        const downloadConfig = await serverStorage.getDownloadConfig(
          testDirectory.baseDirectory
        );
        const response = await clientStorage.download({
          reference: uploadedFile,
          transferConfig: downloadConfig,
          transferType: "local",
          localPath: path.join(testDownloadFolder, "download-config.txt"),
        });
        await assertLocalFile(response, contentBuffer);
      });
    });
  });
});
