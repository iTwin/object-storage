/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";
import { randomUUID } from "crypto";
import { promises, createReadStream } from "fs";

import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {
  BaseDirectory,
  ClientStorage,
  Metadata,
  ObjectReference,
  ServerStorage,
} from "@itwin/object-storage-core";

import { config } from "./Config";
import {
  assertBuffer,
  assertLocalFile,
  assertStream,
  checkUploadedFileValidity,
  TestDirectoryManager,
  TestLocalFileManager,
  uploadTestObjectReference,
} from "./Helpers";

use(chaiAsPromised);

const { clientStorage, serverStorage } = config;

const testDownloadFolder = "test-download";

const testDirectoryManager = new TestDirectoryManager();
const testLocalFileManager = new TestLocalFileManager(path.join(process.cwd(), "lib", "createdFiles"));

beforeEach(async () => {
  await Promise.all([
    testDirectoryManager.purgeCreatedDirectories(),
    testLocalFileManager.purgeCreatedFiles()
  ]);
});

after(async () => {
  await Promise.all([
    testDirectoryManager.purgeCreatedDirectories(),
    testLocalFileManager.purgeCreatedFiles()
  ]);
});

describe(`${ServerStorage.name}: ${serverStorage.constructor.name}`, () => {

  describe(`${serverStorage.create.name}()`, () => {
    it("should create directory", async () => {
      const testDirectory: BaseDirectory = {
        baseDirectory: "test-create-directory",
      };
      try {
        const createDirectoryPromise = serverStorage.create(testDirectory);
        await expect(createDirectoryPromise).to.eventually.be.fulfilled;

        const doesDirectoryExist = await serverStorage.baseDirectoryExists(
          testDirectory
        );
        expect(doesDirectoryExist).to.be.equal(true);
      } finally {
        await serverStorage.deleteBaseDirectory(testDirectory);
      }
    });
    // TODO: add test that check if no child dirs are created
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
      it(`should upload a file from ${caseName} with metadata`, async () => {
        const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
        const fileToUploadPath = await testLocalFileManager.createAndWriteFileBuffer("server-test.txt", contentBuffer);

        const reference = {
          ...testDirectory,
          objectName,
        };

        const metadata = {
          test: "test-metadata",
        };
        const uploadPromise = serverStorage.upload(
          reference,
          dataCallback(fileToUploadPath),
          metadata
        );
        await expect(uploadPromise).to.eventually.be.fulfilled;

        await checkUploadedFileValidity(reference, contentBuffer, metadata);
      });
    }
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
      it(`should upload a file from ${caseName} with metadata`, async () => {
        const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
        const fileToUploadPath = await testLocalFileManager.createAndWriteFileBuffer("server-multipart-test.txt", contentBuffer);

        const reference = {
          ...testDirectory,
          objectName,
        };

        const metadata = {
          test: "test-metadata",
        };
        const uploadPromise = serverStorage.uploadInMultipleParts(
          reference,
          dataCallback(fileToUploadPath),
          {
            metadata,
          }
        );
        await expect(uploadPromise).to.eventually.be.fulfilled;

        await checkUploadedFileValidity(reference, contentBuffer, metadata);
      });
    }
  });

  describe(`${serverStorage.list.name}()`, () => {
    it("should list objects", async () => {
      const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
      const reference1: ObjectReference = {
        baseDirectory: testDirectory.baseDirectory,
        objectName: "reference1"
      };
      const reference2: ObjectReference = {
        baseDirectory: testDirectory.baseDirectory,
        relativeDirectory: "relativeDir",
        objectName: "reference2"
      };
      await uploadTestObjectReference(reference1);
      await uploadTestObjectReference(reference2);

      const queriedReferences = await serverStorage.list(testDirectory);

      expect(queriedReferences.length).to.be.equal(2);
      const queriedReference1 = queriedReferences.find((ref) => ref.objectName === reference1.objectName);
      expect(queriedReference1).to.be.deep.equal(reference1);
      const queriedReference2 = queriedReferences.find((ref) => ref.objectName === reference2.objectName);
      expect(queriedReference2).to.be.deep.equal(reference2);
    });
  });

  describe(`${serverStorage.deleteBaseDirectory.name}()`, () => {
    it("should delete directory with files", async () => {
      const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
      const tempFiles = ["temp-1", "temp-2", "temp-3"];

      await Promise.all(
        tempFiles.map(async (file) =>
          serverStorage.upload(
            { ...testDirectory, objectName: file },
            Buffer.from(file)
          )
        )
      );

      const deleteDirectoryPromise =
        serverStorage.deleteBaseDirectory(testDirectory);

      await expect(deleteDirectoryPromise).to.eventually.be.fulfilled;

      const doesDirectoryExist = await serverStorage.baseDirectoryExists(
        testDirectory
      );
      expect(doesDirectoryExist).to.be.equal(false);
    });

    it("should not throw if base directory does not exist", async () => {
      const deletePromise = serverStorage.deleteBaseDirectory({
        baseDirectory: randomUUID(),
      });

      await expect(deletePromise).to.eventually.be.fulfilled;
    });
  });

  describe(`${serverStorage.deleteObject.name}()`, () => {
    it("should delete object", async () => {
      const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
      const reference: ObjectReference = {
        baseDirectory: testDirectory.baseDirectory,
        relativeDirectory: "relativeDir",
        objectName: "test should delete object.txt"
      };
      await uploadTestObjectReference(reference);

      await serverStorage.deleteObject(reference);

      const objectExists = await serverStorage.objectExists(reference);
      expect(objectExists).to.be.false;
    });

    it("should not throw if file does not exist", async () => {
      const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
      const deletePromise = serverStorage.deleteObject({
        ...testDirectory,
        objectName: randomUUID(),
      });

      await expect(deletePromise).to.eventually.be.fulfilled;
    });

    it("should not throw if the whole path does not exist", async () => {
      const deletePromise = serverStorage.deleteObject({
        baseDirectory: randomUUID(),
        relativeDirectory: randomUUID(),
        objectName: randomUUID(),
      });

      await expect(deletePromise).to.eventually.be.fulfilled;
    });
  });

  describe(`${serverStorage.baseDirectoryExists.name}()`, () => {
    // TODO: enable in the next PR which fixes MinIO behavior
    it.skip("should return true if base directory exists", async () => {
      const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
      const exists = await serverStorage.baseDirectoryExists({
        baseDirectory: testDirectory.baseDirectory,
      });

      expect(exists).to.be.true;
    });

    it("should return false if base directory does not exist", async () => {
      const exists = await serverStorage.baseDirectoryExists({
        baseDirectory: randomUUID(),
      });

      expect(exists).to.be.false;
    });
  });

  describe(`${serverStorage.objectExists.name}()`, () => {
    it("should return true if file exists", async () => {
      const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
      const reference = {
        ...testDirectory,
        objectName: "exists.txt",
      };
      await serverStorage.upload(reference, Buffer.from("test-exists"));

      const exists = await serverStorage.objectExists(reference);
      expect(exists).to.be.true;

      await serverStorage.deleteObject(reference);
    });

    it("should return false if file does not exist", async () => {
      const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
      const exists = await serverStorage.objectExists({
        ...testDirectory,
        objectName: randomUUID(),
      });

      expect(exists).to.be.false;
    });

    it("should return false if the whole path does not exist", async () => {
      const exists = await serverStorage.objectExists({
        baseDirectory: randomUUID(),
        relativeDirectory: randomUUID(),
        objectName: randomUUID(),
      });

      expect(exists).to.be.false;
    });
  });

  describe(`${serverStorage.download.name}()`, () => {
    const contentBuffer = Buffer.from("test-download");

    it("should download a file to buffer", async () => {
      const testDirectory = await testDirectoryManager.createNewDirectory();
      const uploadedFile = await testDirectory.uploadFile({ objectName: "file-to-download.txt" }, contentBuffer, undefined);

      const response = await serverStorage.download(uploadedFile, "buffer");
      assertBuffer(response, contentBuffer);
    });

    it("should download a file to stream", async () => {
      const testDirectory = await testDirectoryManager.createNewDirectory();
      const uploadedFile = await testDirectory.uploadFile({ objectName: "file-to-download.txt" }, contentBuffer, undefined);

      const response = await serverStorage.download(uploadedFile, "stream");
      await assertStream(response, contentBuffer);
    });

    it("should download a file to path", async () => {
      const testDirectory = await testDirectoryManager.createNewDirectory();
      const uploadedFile = await testDirectory.uploadFile({ objectName: "file-to-download.txt" }, contentBuffer, undefined);

      const response = await serverStorage.download(
        uploadedFile,
        "local",
        `${testDownloadFolder}/download.txt` // TODO: test download folder
      );
      await assertLocalFile(response, contentBuffer);
    });
  });

  describe(`${serverStorage.getObjectProperties.name}()`, () => {
    let reference: ObjectReference;
    const data = Buffer.from("test-properties");

    before(async () => {
      const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
      reference = {
        ...testDirectory,
        objectName: "test-object-properties.txt",
      };
      await serverStorage.upload(reference, data, {
        test: "test-metadata",
      });
    });

    it("should get correct object properties", async () => {
      const {
        lastModified,
        reference: _reference,
        size,
        metadata,
      } = await serverStorage.getObjectProperties(reference);

      expect(Date.now() - lastModified.getTime() < 60 * 1000).to.be.true; // not older than 1 minute
      expect(_reference).to.eql(reference);
      expect(size === data.byteLength);
      expect(metadata?.test).to.be.equal("test-metadata");
    });

    after(async () => {
      await serverStorage.deleteObject(reference);
    });
  });

  describe(`${serverStorage.updateMetadata.name}()`, () => {
    it("should update metadata", async () => {
      const initialMetadata: Metadata = {
        test: "test-metadata"
      };
      const testDirectory = await testDirectoryManager.createNewDirectory();
      const uploadedFile = await testDirectory.uploadFile({ objectName: "update-metadata-test.txt" }, Buffer.from("test-metadata"), initialMetadata) // TODO: generate random metadata in upload file method

      const { metadata } = await serverStorage.getObjectProperties(uploadedFile);
      expect(metadata?.test).to.be.equal(initialMetadata.test);

      const updatedMetadata: Metadata = {
        test: "test-metadata-updated",
      }
      const updateMetadataPromise = serverStorage.updateMetadata(uploadedFile, updatedMetadata);
      await expect(updateMetadataPromise).to.eventually.be.fulfilled;

      const { metadata: metadataUpdated } =
        await serverStorage.getObjectProperties(uploadedFile);
      expect(metadataUpdated?.test).to.be.equal(updatedMetadata.test);
    });

    // TODO: test that only a single prop is updated
  });
});

describe(`${ClientStorage.name}: ${clientStorage.constructor.name}`, () => {

  before(async () => {
  });

  after(async () => testDirectoryManager.purgeCreatedDirectories());

  describe("PresignedUrlProvider", () => {
    describe(`${clientStorage.upload.name}() & ${serverStorage.getUploadUrl.name}()`, () => {
      const contentBuffer = Buffer.from("test-url-upload-content");
      const fileToUploadPath = "client-url-test.txt";

      const testUploadUrlLocalFile = "test-upload-url-local.txt";
      const testUploadUrlBufferFile = "test-upload-url-buffer.txt";
      const testUploadUrlStreamFile = "test-upload-url-stream.txt";

      const uploadTestCases = [
        {
          caseName: "Buffer",
          objectName: testUploadUrlBufferFile,
          dataCallback: () => contentBuffer,
        },
        {
          caseName: "Stream",
          objectName: testUploadUrlStreamFile,
          dataCallback: () => createReadStream(fileToUploadPath),
        },
        {
          caseName: "path",
          objectName: testUploadUrlLocalFile,
          dataCallback: () => fileToUploadPath,
        },
      ];

      before(async () => {
        await promises.writeFile(fileToUploadPath, contentBuffer);
      });

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;
        it(`should upload a file from ${caseName} with metadata to URL`, async () => {
          const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
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
          await expect(uploadPromise).to.eventually.be.fulfilled;

          await checkUploadedFileValidity(reference, contentBuffer, metadata);
        });
      }
    });

    describe(`${serverStorage.download.name}() & ${serverStorage.getDownloadUrl.name}()`, () => {
      let reference: ObjectReference;
      const contentBuffer = Buffer.from("test-download-url");

      before(async () => {
        const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
        reference = {
          ...testDirectory,
          objectName: "file-to-download-from-url.txt",
        };
        await serverStorage.upload(reference, contentBuffer);
      });

      it(`should download a file to buffer from URL`, async () => {
        const downloadUrl = await serverStorage.getDownloadUrl(reference);
        const response = await clientStorage.download({
          url: downloadUrl,
          transferType: "buffer",
        });
        assertBuffer(response, contentBuffer);
      });

      it(`should download a file to stream from URL`, async () => {
        const downloadUrl = await serverStorage.getDownloadUrl(reference);
        const response = await clientStorage.download({
          url: downloadUrl,
          transferType: "stream",
        });
        await assertStream(response, contentBuffer);
      });

      it(`should download a file to path from URL`, async () => {
        const downloadUrl = await serverStorage.getDownloadUrl(reference);
        const response = await clientStorage.download({
          url: downloadUrl,
          transferType: "local",
          localPath: `${testDownloadFolder}/download-url.txt`,
        });
        await assertLocalFile(response, contentBuffer);
      });

      after(async () => {
        await Promise.all([
          serverStorage.deleteObject(reference),
          promises.rmdir(testDownloadFolder, { recursive: true }),
        ]);
      });
    });
  });

  describe("TransferConfigProvider", () => {
    describe(`${clientStorage.upload.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
      const contentBuffer = Buffer.from("test-config-upload-content");
      const fileToUploadPath = "client-config-test.txt";

      const uploadTestCases = [
        {
          caseName: "Buffer",
          objectName: "test-upload-config-buffer.txt",
          dataCallback: () => contentBuffer,
        },
        {
          caseName: "Stream",
          objectName: "test-upload-config-stream.txt",
          dataCallback: () => createReadStream(fileToUploadPath),
        },
        {
          caseName: "path",
          objectName: "test-upload-config-local.txt",
          dataCallback: () => fileToUploadPath,
        },
      ];

      before(async () => {
        await promises.writeFile(fileToUploadPath, contentBuffer);
      })

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;
        it(`should upload a file from ${caseName} with metadata using transfer config`, async () => {
          const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
          const reference = {
            ...testDirectory,
            objectName,
          };
          const metadata = {
            test: "test-metadata",
          };

          const uploadConfig = await serverStorage.getUploadConfig({
            ...testDirectory,
          });

          const uploadPromise = clientStorage.upload({
            data: dataCallback(),
            reference,
            transferConfig: uploadConfig,
            metadata,
          });
          await expect(uploadPromise).to.eventually.be.fulfilled;

          await checkUploadedFileValidity(reference, contentBuffer, metadata);
        });
      }
    });

    describe(`${clientStorage.uploadInMultipleParts.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
      const contentBuffer = Buffer.from("test-config-multipart-upload-content");
      const fileToUploadPath = "client-config-test-multipart.txt";

      const uploadTestCases = [
        {
          caseName: "Stream",
          objectName: "test-multipart-upload-config-stream.txt",
          dataCallback: () => createReadStream(fileToUploadPath),
        },
        {
          caseName: "path",
          objectName: "test-multipart-upload-config-local.txt",
          dataCallback: () => fileToUploadPath,
        },
      ];

      before(async () => {
        await promises.writeFile(fileToUploadPath, contentBuffer);
      });

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;
        it(`should upload a file from ${caseName} with metadata using transfer config`, async () => {
          const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
          const reference = {
            ...testDirectory,
            objectName,
          };
          const metadata = {
            test: "test-metadata",
          };

          const uploadConfig = await serverStorage.getUploadConfig(testDirectory);
          const multipartUploadPromise = clientStorage.uploadInMultipleParts({
            data: dataCallback(),
            reference,
            transferConfig: uploadConfig,
            options: { metadata },
          });
          await expect(multipartUploadPromise).to.eventually.be.fulfilled;

          await checkUploadedFileValidity(reference, contentBuffer, metadata);
        });
      }
    });

    describe(`${clientStorage.download.name}() & ${serverStorage.getDownloadConfig.name}()`, () => {
      let testDirectory: BaseDirectory
      let reference: ObjectReference;
      const contentBuffer = Buffer.from("test-download-config");

      before(async () => {
        const testDirectory = (await testDirectoryManager.createNewDirectory()).baseDirectory;
        reference = {
          ...testDirectory,
          objectName: "file-to-download-with-config.txt",
        };
        await serverStorage.upload(reference, contentBuffer);
      });

      it(`should download a file to buffer using transfer config`, async () => {
        const downloadConfig = await serverStorage.getDownloadConfig(testDirectory);
        const response = await clientStorage.download({
          reference,
          transferConfig: downloadConfig,
          transferType: "buffer",
        });
        assertBuffer(response, contentBuffer);
      });

      it(`should download a file to stream using transfer config`, async () => {
        const downloadConfig = await serverStorage.getDownloadConfig(testDirectory);
        const response = await clientStorage.download({
          reference,
          transferConfig: downloadConfig,
          transferType: "stream",
        });
        await assertStream(response, contentBuffer);
      });

      it(`should download a file to path using transfer config`, async () => {
        const downloadConfig = await serverStorage.getDownloadConfig(testDirectory);
        const response = await clientStorage.download({
          reference,
          transferConfig: downloadConfig,
          transferType: "local",
          localPath: `${testDownloadFolder}/download-config.txt`,
        });
        await assertLocalFile(response, contentBuffer);
      });

      after(async () => {
        await Promise.all([
          serverStorage.deleteObject(reference),
          promises.rmdir(testDownloadFolder, { recursive: true }),
        ]);
      });
    });
  });
});
