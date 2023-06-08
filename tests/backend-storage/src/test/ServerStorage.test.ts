/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import * as path from "path";

import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {
  ExpiryOptions,
  secondsInHour,
} from "@itwin/object-storage-core/lib/common/internal";
import { getRandomString } from "@itwin/object-storage-core/lib/server/internal";

import {
  BaseDirectory,
  ContentHeaders,
  Metadata,
  ObjectReference,
  ServerStorage,
} from "@itwin/object-storage-core";

import { config } from "./Config";
import { testDirectoryManager, testLocalFileManager } from "./Global.test";
import {
  assertBuffer,
  assertLocalFile,
  assertStream,
  checkUploadedFileValidity,
  queryAndAssertCacheControl,
  queryAndAssertContentEncoding,
  queryAndAssertContentType,
  queryAndAssertMetadata,
  TestRemoteDirectory,
} from "./utils";

use(chaiAsPromised);

const { serverStorage } = config;

describe(`${ServerStorage.name}: ${serverStorage.constructor.name}`, () => {
  describe(`${serverStorage.createBaseDirectory.name}()`, () => {
    it("should create directory", async () => {
      const testDirectory: BaseDirectory = {
        baseDirectory: `test-create-directory-${getRandomString()}`,
      };
      testDirectoryManager.addForDelete(testDirectory);

      await serverStorage.createBaseDirectory(testDirectory);

      const exists = await serverStorage.baseDirectoryExists(testDirectory);
      expect(exists).to.be.equal(true);
    });
  });

  describe(`${serverStorage.upload.name}()`, () => {
    const contentBuffer = Buffer.from("server-upload-content");
    const uploadTestCases = [
      {
        caseName: "Buffer",
        objectName: "test-upload-buffer.txt",
        dataCallback: (_sourcePath: string) => contentBuffer,
      },
      {
        caseName: "Stream",
        objectName: "test-upload-stream.txt",
        dataCallback: (sourcePath: string) => createReadStream(sourcePath),
      },
      {
        caseName: "path",
        objectName: "test-upload-local.txt",
        dataCallback: (sourcePath: string) => sourcePath,
      },
    ];

    for (const testCase of uploadTestCases) {
      const { caseName, objectName, dataCallback } = testCase;

      it(`should upload a file from ${caseName}`, async () => {
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-server-upload.txt",
            contentBuffer
          );
        const testBaseDirectory: BaseDirectory = (
          await testDirectoryManager.createNew()
        ).baseDirectory;
        const reference: ObjectReference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          objectName,
        };

        await serverStorage.upload(reference, dataCallback(fileToUploadPath));

        await checkUploadedFileValidity(reference, contentBuffer);
      });

      it(`should upload a file with relative directory from ${caseName}`, async () => {
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-server-upload-relative-dir.txt",
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
        const metadata: Metadata = {
          test: "test-metadata",
        };

        await serverStorage.upload(
          reference,
          dataCallback(fileToUploadPath),
          metadata
        );

        await checkUploadedFileValidity(reference, contentBuffer);
      });

      it(`should upload a file from ${caseName} with metadata`, async () => {
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-server-upload-metadata.txt",
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

        await serverStorage.upload(
          reference,
          dataCallback(fileToUploadPath),
          metadata
        );

        await checkUploadedFileValidity(reference, contentBuffer);
        await queryAndAssertMetadata(reference, metadata);
      });

      it(`should upload a file from ${caseName} with contentEncoding header`, async () => {
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-server-upload-metadata.txt",
            contentBuffer
          );
        const testBaseDirectory: BaseDirectory = (
          await testDirectoryManager.createNew()
        ).baseDirectory;
        const reference: ObjectReference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          objectName,
        };
        const headers: ContentHeaders = {
          contentEncoding: "test-encoding",
        };

        await serverStorage.upload(
          reference,
          dataCallback(fileToUploadPath),
          undefined,
          headers
        );

        await checkUploadedFileValidity(reference, contentBuffer);
        await queryAndAssertContentEncoding(reference, headers);
      });

      it(`should upload a file from ${caseName} with cacheControl header`, async () => {
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-server-upload-metadata.txt",
            contentBuffer
          );
        const testBaseDirectory: BaseDirectory = (
          await testDirectoryManager.createNew()
        ).baseDirectory;
        const reference: ObjectReference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          objectName,
        };
        const headers: ContentHeaders = {
          cacheControl: "private",
        };

        await serverStorage.upload(
          reference,
          dataCallback(fileToUploadPath),
          undefined,
          headers
        );

        await checkUploadedFileValidity(reference, contentBuffer);
        await queryAndAssertCacheControl(reference, headers);
      });

      it(`should upload a file from ${caseName} with contentType header`, async () => {
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-server-upload-metadata.txt",
            contentBuffer
          );
        const testBaseDirectory: BaseDirectory = (
          await testDirectoryManager.createNew()
        ).baseDirectory;
        const reference: ObjectReference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          objectName,
        };
        const headers: ContentHeaders = {
          contentType: "application/json",
        };

        await serverStorage.upload(
          reference,
          dataCallback(fileToUploadPath),
          undefined,
          headers
        );

        await checkUploadedFileValidity(reference, contentBuffer);
        await queryAndAssertContentType(reference, headers);
      });
    }

    it("should fail to upload if specified path contains empty file", async () => {
      const emptyFilePath: string =
        await testLocalFileManager.createAndWriteFile("test-empty-file.txt");

      const uploadPromise = serverStorage.upload(
        {
          baseDirectory: "test-directory",
          objectName: "test-object-name",
        },
        emptyFilePath
      );

      await expect(uploadPromise).to.eventually.be.rejectedWith(
        Error,
        "Provided path is an empty file."
      );
    });
  });

  describe(`${serverStorage.uploadInMultipleParts.name}()`, function () {
    const contentBuffer = Buffer.from("server-multipart-upload-content");
    const uploadTestCases = [
      {
        caseName: "Stream",
        objectName: "test-multipart-upload-stream.txt",
        dataCallback: (sourcePath: string) => createReadStream(sourcePath),
      },
      {
        caseName: "path",
        objectName: "test-multipart-upload-local.txt",
        dataCallback: (sourcePath: string) => sourcePath,
      },
    ];

    for (const testCase of uploadTestCases) {
      const { caseName, objectName, dataCallback } = testCase;

      it(`should upload a file from ${caseName}`, async () => {
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-multipart-server-upload.txt",
            contentBuffer
          );
        const testBaseDirectory: BaseDirectory = (
          await testDirectoryManager.createNew()
        ).baseDirectory;
        const reference: ObjectReference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          objectName,
        };

        await serverStorage.uploadInMultipleParts(
          reference,
          dataCallback(fileToUploadPath)
        );

        await checkUploadedFileValidity(reference, contentBuffer);
      });

      it(`should upload a file with relative directory from ${caseName}`, async () => {
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-multipart-server-upload-relative-dir.txt",
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

        await serverStorage.uploadInMultipleParts(
          reference,
          dataCallback(fileToUploadPath)
        );

        await checkUploadedFileValidity(reference, contentBuffer);
      });

      it(`should upload a file from ${caseName} with metadata`, async () => {
        const fileToUploadPath: string =
          await testLocalFileManager.createAndWriteFile(
            "test-multipart-server-upload-metadata.txt",
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

        await serverStorage.uploadInMultipleParts(
          reference,
          dataCallback(fileToUploadPath),
          { metadata }
        );

        await checkUploadedFileValidity(reference, contentBuffer);
        await queryAndAssertMetadata(reference, metadata);
      });
    }

    it("should fail to upload in multiple parts if specified path contains empty file", async () => {
      const emptyFilePath: string =
        await testLocalFileManager.createAndWriteFile("test-empty-file.txt");

      const uploadPromise = serverStorage.uploadInMultipleParts(
        {
          baseDirectory: "test-directory",
          objectName: "test-object-name",
        },
        emptyFilePath
      );

      await expect(uploadPromise).to.eventually.be.rejectedWith(
        Error,
        "Provided path is an empty file."
      );
    });
  });

  describe(`${serverStorage.listObjects.name}()`, () => {
    it("should list objects", async () => {
      await serverStorageListTest(
        serverStorage,
        async (directory: BaseDirectory) => serverStorage.listObjects(directory)
      );
    });
  });

  // eslint-disable-next-line deprecation/deprecation
  describe(`${serverStorage.list.name}()`, () => {
    it("should list objects. DEPRECATED", async () => {
      await serverStorageListTest(
        serverStorage,
        // eslint-disable-next-line deprecation/deprecation
        async (directory: BaseDirectory) => serverStorage.list(directory)
      );
    });
  });

  describe(`${serverStorage.listDirectories.name}()`, () => {
    it("should list directories", async () => {
      const testDirectory1: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const testDirectory2: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const testDirectory3: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const queriedDirectories = await serverStorage.listDirectories();

      const queriedDirectory1 = queriedDirectories.find(
        (ref) =>
          ref.baseDirectory === testDirectory1.baseDirectory.baseDirectory
      );
      const queriedDirectory2 = queriedDirectories.find(
        (ref) =>
          ref.baseDirectory === testDirectory2.baseDirectory.baseDirectory
      );
      const queriedDirectory3 = queriedDirectories.find(
        (ref) =>
          ref.baseDirectory === testDirectory3.baseDirectory.baseDirectory
      );

      expect(queriedDirectory1).to.be.deep.equal(testDirectory1.baseDirectory);
      expect(queriedDirectory2).to.be.deep.equal(testDirectory2.baseDirectory);
      expect(queriedDirectory3).to.be.deep.equal(testDirectory3.baseDirectory);
    });

    it("should not list subdirectories", async () => {
      const testDirectory1: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const testDirectory2: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      await testDirectory1.uploadFile(
        { objectName: `test/ref1.obj` },
        undefined,
        undefined
      );
      const queriedDirectories = await serverStorage.listDirectories();

      const queriedDirectory1 = queriedDirectories.find(
        (ref) =>
          ref.baseDirectory === testDirectory1.baseDirectory.baseDirectory
      );
      const queriedDirectory2 = queriedDirectories.find(
        (ref) =>
          ref.baseDirectory === testDirectory2.baseDirectory.baseDirectory
      );
      const queriedSubDirectory1 = queriedDirectories.find(
        (ref) => ref.baseDirectory === `${testDirectory1.baseDirectory}/test`
      );
      expect(queriedDirectory1).to.be.deep.equal(testDirectory1.baseDirectory);
      expect(queriedDirectory2).to.be.deep.equal(testDirectory2.baseDirectory);
      expect(queriedSubDirectory1).to.be.undefined;
    });
  });

  describe(`${serverStorage.deleteBaseDirectory.name}()`, () => {
    it("should delete directory with files", async () => {
      const testDirectory: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const tempFiles = ["temp-1", "temp-2", "temp-3"];
      await Promise.all(
        tempFiles.map(async (file) =>
          testDirectory.uploadFile(
            { objectName: file },
            Buffer.from(file),
            undefined
          )
        )
      );

      await serverStorage.deleteBaseDirectory(testDirectory.baseDirectory);

      const doesDirectoryExist = await serverStorage.baseDirectoryExists(
        testDirectory.baseDirectory
      );
      expect(doesDirectoryExist).to.be.equal(false);
    });

    it("should not throw if base directory does not exist", async () => {
      const deletePromise = serverStorage.deleteBaseDirectory({
        baseDirectory: getRandomString(),
      });

      await expect(deletePromise).to.eventually.be.fulfilled;
    });
  });

  describe(`${serverStorage.deleteObject.name}()`, async () => {
    it("should delete object", async () => {
      const testDirectory: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const reference: ObjectReference = await testDirectory.uploadFile(
        { objectName: "test-delete.txt" },
        undefined,
        undefined
      );

      await serverStorage.deleteObject(reference);

      const objectExists = await serverStorage.objectExists(reference);
      expect(objectExists).to.be.false;
    });

    it("should not throw if file does not exist", async () => {
      const testBaseDirectory: BaseDirectory = (
        await testDirectoryManager.createNew()
      ).baseDirectory;
      const deletePromise = serverStorage.deleteObject({
        baseDirectory: testBaseDirectory.baseDirectory,
        objectName: getRandomString(),
      });

      await expect(deletePromise).to.eventually.be.fulfilled;
    });

    it("should not throw if the whole path does not exist", async () => {
      const deletePromise = serverStorage.deleteObject({
        baseDirectory: getRandomString(),
        relativeDirectory: getRandomString(),
        objectName: getRandomString(),
      });

      await expect(deletePromise).to.eventually.be.fulfilled;
    });

    it("should retain the directory after all files from it have been deleted", async () => {
      const testBaseDirectory: BaseDirectory = (
        await testDirectoryManager.createNew()
      ).baseDirectory;
      const testFileToUpload: ObjectReference = {
        baseDirectory: testBaseDirectory.baseDirectory,
        objectName: "test-delete-object.txt",
      };
      const contentBuffer = Buffer.from("test-delete-object");
      await serverStorage.upload(testFileToUpload, contentBuffer);

      await serverStorage.deleteObject(testFileToUpload);

      const exists = await serverStorage.baseDirectoryExists(testBaseDirectory);
      expect(exists).to.be.true;
    });
  });

  describe(`${serverStorage.baseDirectoryExists.name}()`, () => {
    it("should return true if base directory exists", async () => {
      const testBaseDirectory: BaseDirectory = (
        await testDirectoryManager.createNew()
      ).baseDirectory;
      const exists = await serverStorage.baseDirectoryExists({
        baseDirectory: testBaseDirectory.baseDirectory,
      });

      expect(exists).to.be.true;
    });

    it("should return false if base directory does not exist", async () => {
      const exists = await serverStorage.baseDirectoryExists({
        baseDirectory: getRandomString(),
      });

      expect(exists).to.be.false;
    });
  });

  describe(`${serverStorage.objectExists.name}()`, () => {
    it("should return true if file exists", async () => {
      const testDirectory: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const reference: ObjectReference = await testDirectory.uploadFile(
        { objectName: "test-exists.txt" },
        undefined,
        undefined
      );

      const exists = await serverStorage.objectExists(reference);

      expect(exists).to.be.true;
    });

    it("should return false if file does not exist", async () => {
      const testBaseDirectory: BaseDirectory = (
        await testDirectoryManager.createNew()
      ).baseDirectory;

      const exists = await serverStorage.objectExists({
        baseDirectory: testBaseDirectory.baseDirectory,
        objectName: getRandomString(),
      });

      expect(exists).to.be.false;
    });

    it("should return false if the whole path does not exist", async () => {
      const exists = await serverStorage.objectExists({
        baseDirectory: getRandomString(),
        relativeDirectory: getRandomString(),
        objectName: getRandomString(),
      });

      expect(exists).to.be.false;
    });
  });

  describe(`${serverStorage.download.name}()`, () => {
    const contentBuffer = Buffer.from("test-download");

    it("should download a file to buffer", async () => {
      const testDirectory: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const uploadedFile: ObjectReference = await testDirectory.uploadFile(
        { objectName: "file-to-download.txt" },
        contentBuffer,
        undefined
      );

      const response = await serverStorage.download(uploadedFile, "buffer");

      assertBuffer(response, contentBuffer);
    });

    it("should download a file to stream", async () => {
      const testDirectory: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const uploadedFile: ObjectReference = await testDirectory.uploadFile(
        { objectName: "file-to-download.txt" },
        contentBuffer,
        undefined
      );

      const response = await serverStorage.download(uploadedFile, "stream");

      await assertStream(response, contentBuffer);
    });

    it("should download a file to path", async () => {
      const testDownloadFolder = await testLocalFileManager.getDownloadsDir();
      const testDirectory: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const uploadedFile: ObjectReference = await testDirectory.uploadFile(
        { objectName: "file-to-download.txt" },
        contentBuffer,
        undefined
      );

      const response = await serverStorage.download(
        uploadedFile,
        "local",
        path.join(testDownloadFolder, "download.txt")
      );

      await assertLocalFile(response, contentBuffer);
    });
  });

  describe(`${serverStorage.getObjectProperties.name}()`, () => {
    it("should get correct object properties", async () => {
      const data = Buffer.from("test-properties");
      const testDirectory: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const uploadMetadata: Metadata = {
        test: "test-metadata",
      };
      const uploadedFile: ObjectReference = await testDirectory.uploadFile(
        { objectName: "test-object-properties.txt" },
        data,
        uploadMetadata
      );

      const {
        lastModified,
        reference: queriedReference,
        size,
        metadata,
      } = await serverStorage.getObjectProperties(uploadedFile);

      expect(Date.now() - lastModified.getTime() < 60 * 1000).to.be.true; // not older than 1 minute
      expect(queriedReference).to.equal(uploadedFile);
      expect(size === data.byteLength);
      expect(metadata?.test).to.be.equal("test-metadata");
    });
  });

  describe(`${serverStorage.updateMetadata.name}()`, () => {
    it("should update metadata", async () => {
      const testDirectory: TestRemoteDirectory =
        await testDirectoryManager.createNew();
      const initialMetadata: Metadata = {
        test1: "test-metadata-1",
        test2: "test-metadata-2",
      };
      const uploadedFile: ObjectReference = await testDirectory.uploadFile(
        { objectName: "update-metadata-test.txt" },
        Buffer.from("test-metadata"),
        initialMetadata
      );
      await queryAndAssertMetadata(uploadedFile, initialMetadata);

      const updatedMetadata1: Metadata = {
        test1: "test-metadata-1",
        test2: "update-test-metadata-2",
      };
      await serverStorage.updateMetadata(uploadedFile, updatedMetadata1);
      await queryAndAssertMetadata(uploadedFile, updatedMetadata1);

      const updatedMetadata2: Metadata = {
        test3: "test-metadata-3",
      };
      await serverStorage.updateMetadata(uploadedFile, updatedMetadata2);
      await queryAndAssertMetadata(uploadedFile, updatedMetadata2);
    });
  });

  [
    serverStorage.getDownloadConfig.bind(serverStorage),
    serverStorage.getUploadConfig.bind(serverStorage),
  ].forEach((getTransferConfig) => {
    describe(`${getTransferConfig.name}()`, () => {
      it("should throw if both expiresInSeconds and expiresOn are set", async () => {
        const testDirectory: TestRemoteDirectory =
          await testDirectoryManager.createNew();
        await expect(
          getTransferConfig(testDirectory.baseDirectory, {
            expiresInSeconds: 1,
            expiresOn: new Date(),
          } as unknown as ExpiryOptions)
        ).to.eventually.be.rejectedWith(
          Error,
          "Only one of 'expiresInSeconds' and 'expiresOn' can be specified."
        );
      });

      it("should use expiresInSeconds if set", async () => {
        const testDirectory: TestRemoteDirectory =
          await testDirectoryManager.createNew();
        const expiresInSeconds = 1000;
        const downloadConfig = await getTransferConfig(
          testDirectory.baseDirectory,
          {
            expiresInSeconds,
          }
        );

        expect(downloadConfig.expiration.getTime()).to.be.approximately(
          Date.now() + expiresInSeconds * 1000,
          10_000
        );
      });

      it("should use expiresOn if set", async () => {
        const testDirectory: TestRemoteDirectory =
          await testDirectoryManager.createNew();
        const expiresOn = new Date(Date.now() + 1_000_000);
        const downloadConfig = await getTransferConfig(
          testDirectory.baseDirectory,
          {
            expiresOn,
          }
        );

        expect(downloadConfig.expiration.getTime()).to.be.approximately(
          expiresOn.getTime(),
          10_000
        );
      });

      it("should expire in one hour if neither expiresOn nor expiresInSecond is set", async () => {
        const testDirectory: TestRemoteDirectory =
          await testDirectoryManager.createNew();
        const downloadConfig = await getTransferConfig(
          testDirectory.baseDirectory
        );

        expect(downloadConfig.expiration.getTime()).to.be.approximately(
          Date.now() + secondsInHour * 1000,
          10_000
        );
      });
    });
  });
});

async function serverStorageListTest(
  serviceStorage: ServerStorage,
  func: (directory: BaseDirectory) => Promise<ObjectReference[]>
): Promise<void> {
  const testDirectory: TestRemoteDirectory =
    await testDirectoryManager.createNew();
  const reference1: ObjectReference = await testDirectory.uploadFile(
    { objectName: "reference1" },
    undefined,
    undefined
  );
  const reference2: ObjectReference = await testDirectory.uploadFile(
    { objectName: "reference2" },
    undefined,
    undefined
  );

  const queriedReferences = await func.call(
    serviceStorage,
    testDirectory.baseDirectory
  );

  expect(queriedReferences.length).to.be.equal(2);
  const queriedReference1 = queriedReferences.find(
    (ref) => ref.objectName === reference1.objectName
  );
  expect(queriedReference1).to.be.deep.equal(reference1);
  const queriedReference2 = queriedReferences.find(
    (ref) => ref.objectName === reference2.objectName
  );
  expect(queriedReference2).to.be.deep.equal(reference2);
}
