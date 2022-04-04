/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomUUID } from "crypto";
import { createReadStream, promises } from "fs";
import * as path from "path";

import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {
  BaseDirectory,
  ClientStorage,
  Metadata,
  ObjectDirectory,
  ObjectReference,
  ServerStorage,
} from "@itwin/object-storage-core";

import { config } from "./Config";
import {
  assertBuffer,
  assertLocalFile,
  assertStream,
  checkUploadedFileValidity,
  queryAndAssertMetadata,
  TestLocalFileManager,
  TestRemoteDirectoryManager,
  uploadTestObjectReference,
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

describe(`${ServerStorage.name}: ${serverStorage.constructor.name}`, () => {
  describe(`${serverStorage.createBaseDirectory.name}()`, () => {
    it("should create directory", async () => {
      const testDirectory: BaseDirectory = {
        baseDirectory: "test-create-directory",
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
        const testBaseDirectory = (await testDirectoryManager.createNew())
          .baseDirectory;
        const fileToUploadPath = await testLocalFileManager.createAndWriteFile(
          "server-test.txt",
          contentBuffer
        );
        const reference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          objectName,
        };

        await serverStorage.upload(
          reference,
          dataCallback(fileToUploadPath)
        );

        await checkUploadedFileValidity(reference, contentBuffer);
      });

      it(`should upload a file with relative directory from ${caseName}`, async () => {
        const testBaseDirectory = (await testDirectoryManager.createNew())
          .baseDirectory;
        const fileToUploadPath = await testLocalFileManager.createAndWriteFile(
          "server-test.txt",
          contentBuffer
        );

        const reference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          relativeDirectory: path.join("relative1, relative2"),
          objectName,
        };

        const metadata = {
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
        const testBaseDirectory = (await testDirectoryManager.createNew())
          .baseDirectory;
        const fileToUploadPath = await testLocalFileManager.createAndWriteFile(
          "server-test.txt",
          contentBuffer
        );

        const reference = {
          baseDirectory: testBaseDirectory.baseDirectory,
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

        await checkUploadedFileValidity(reference, contentBuffer);
        await queryAndAssertMetadata(reference, metadata);
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
      it(`should upload a file from ${caseName}`, async () => {
        const testBaseDirectory = (await testDirectoryManager.createNew())
          .baseDirectory;
        const fileToUploadPath = await testLocalFileManager.createAndWriteFile(
          "server-multipart-test.txt",
          contentBuffer
        );
        const reference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          objectName,
        };

        await serverStorage.uploadInMultipleParts(
          reference,
          dataCallback(fileToUploadPath),
        );

        await checkUploadedFileValidity(reference, contentBuffer);
      });

      it(`should upload a file with relative directory from ${caseName}`, async () => {
        const testBaseDirectory = (await testDirectoryManager.createNew())
          .baseDirectory;
        const fileToUploadPath = await testLocalFileManager.createAndWriteFile(
          "server-multipart-test.txt",
          contentBuffer
        );

        const reference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          relativeDirectory: path.join("relative1", "relative2"),
          objectName,
        };

        await serverStorage.uploadInMultipleParts(
          reference,
          dataCallback(fileToUploadPath)
        );

        await checkUploadedFileValidity(reference, contentBuffer);
      });

      it(`should upload a file from ${caseName} with metadata`, async () => {
        const testBaseDirectory = (await testDirectoryManager.createNew())
          .baseDirectory;
        const fileToUploadPath = await testLocalFileManager.createAndWriteFile(
          "server-multipart-test.txt",
          contentBuffer
        );

        const reference = {
          baseDirectory: testBaseDirectory.baseDirectory,
          objectName,
        };

        const metadata = {
          test: "test-metadata",
        };
        await serverStorage.uploadInMultipleParts(
          reference,
          dataCallback(fileToUploadPath),
          {
            metadata,
          }
        );

        await checkUploadedFileValidity(reference, contentBuffer);
        await queryAndAssertMetadata(reference, metadata);
      });
    }
  });

  describe(`${serverStorage.list.name}()`, () => {
    it("should list objects", async () => {
      const testBaseDirectory = (await testDirectoryManager.createNew())
        .baseDirectory;
      const reference1: ObjectReference = {
        baseDirectory: testBaseDirectory.baseDirectory,
        objectName: "reference1",
      };
      const reference2: ObjectReference = {
        baseDirectory: testBaseDirectory.baseDirectory,
        relativeDirectory: "relativeDir",
        objectName: "reference2",
      };
      await uploadTestObjectReference(reference1);
      await uploadTestObjectReference(reference2);

      const queriedReferences = await serverStorage.list(testBaseDirectory);

      expect(queriedReferences.length).to.be.equal(2);
      const queriedReference1 = queriedReferences.find(
        (ref) => ref.objectName === reference1.objectName
      );
      expect(queriedReference1).to.be.deep.equal(reference1);
      const queriedReference2 = queriedReferences.find(
        (ref) => ref.objectName === reference2.objectName
      );
      expect(queriedReference2).to.be.deep.equal(reference2);
    });
  });

  describe(`${serverStorage.deleteBaseDirectory.name}()`, () => {
    it("should delete directory with files", async () => {
      const testBaseDirectory = (await testDirectoryManager.createNew())
        .baseDirectory;
      const tempFiles = ["temp-1", "temp-2", "temp-3"];

      await Promise.all(
        tempFiles.map(async (file) =>
          serverStorage.upload(
            {
              baseDirectory: testBaseDirectory.baseDirectory,
              objectName: file,
            },
            Buffer.from(file)
          )
        )
      );

      const deleteDirectoryPromise =
        serverStorage.deleteBaseDirectory(testBaseDirectory);

      await expect(deleteDirectoryPromise).to.eventually.be.fulfilled;

      const doesDirectoryExist = await serverStorage.baseDirectoryExists(
        testBaseDirectory
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
      const testBaseDirectory = (await testDirectoryManager.createNew())
        .baseDirectory;
      const reference: ObjectReference = {
        baseDirectory: testBaseDirectory.baseDirectory,
        relativeDirectory: "relativeDir",
        objectName: "test should delete object.txt",
      };
      await uploadTestObjectReference(reference);

      await serverStorage.deleteObject(reference);

      const objectExists = await serverStorage.objectExists(reference);
      expect(objectExists).to.be.false;
    });

    it("should not throw if file does not exist", async () => {
      const testBaseDirectory = (await testDirectoryManager.createNew())
        .baseDirectory;
      const deletePromise = serverStorage.deleteObject({
        baseDirectory: testBaseDirectory.baseDirectory,
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

    it("should retain the directory after all files from it have been deleted", async () => {
      const testBaseDirectory: ObjectDirectory = (
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
      const testBaseDirectory = (await testDirectoryManager.createNew())
        .baseDirectory;
      const exists = await serverStorage.baseDirectoryExists({
        baseDirectory: testBaseDirectory.baseDirectory,
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
      const testBaseDirectory = (await testDirectoryManager.createNew())
        .baseDirectory;
      const reference = {
        baseDirectory: testBaseDirectory.baseDirectory,
        objectName: "exists.txt",
      };
      await serverStorage.upload(reference, Buffer.from("test-exists"));

      const exists = await serverStorage.objectExists(reference);
      expect(exists).to.be.true;

      await serverStorage.deleteObject(reference);
    });

    it("should return false if file does not exist", async () => {
      const testBaseDirectory = (await testDirectoryManager.createNew())
        .baseDirectory;
      const exists = await serverStorage.objectExists({
        baseDirectory: testBaseDirectory.baseDirectory,
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
      const testDirectory = await testDirectoryManager.createNew();
      const uploadedFile = await testDirectory.uploadFile(
        { objectName: "file-to-download.txt" },
        contentBuffer,
        undefined
      );

      const response = await serverStorage.download(uploadedFile, "buffer");
      assertBuffer(response, contentBuffer);
    });

    it("should download a file to stream", async () => {
      const testDirectory = await testDirectoryManager.createNew();
      const uploadedFile = await testDirectory.uploadFile(
        { objectName: "file-to-download.txt" },
        contentBuffer,
        undefined
      );

      const response = await serverStorage.download(uploadedFile, "stream");
      await assertStream(response, contentBuffer);
    });

    it("should download a file to path", async () => {
      const testDirectory = await testDirectoryManager.createNew();
      const uploadedFile = await testDirectory.uploadFile(
        { objectName: "file-to-download.txt" },
        contentBuffer,
        undefined
      );
      const testDownloadFolder = await testLocalFileManager.getDownloadsDir();

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
      const testDirectory = await testDirectoryManager.createNew();
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
      const testDirectory = await testDirectoryManager.createNew();
      const initialMetadata: Metadata = {
        test1: "test-metadata-1",
        test2: "test-metadata-2",
      };
      const uploadedFile = await testDirectory.uploadFile(
        { objectName: "update-metadata-test.txt" },
        Buffer.from("test-metadata"),
        initialMetadata
      );
      queryAndAssertMetadata(uploadedFile, initialMetadata);

      const updatedMetadata1: Metadata = {
        test1: "test-metadata-1",
        test2: "update-test-metadata-2",
      };
      await serverStorage.updateMetadata(
        uploadedFile,
        updatedMetadata1
      );
      queryAndAssertMetadata(uploadedFile, updatedMetadata1);

      const updatedMetadata2: Metadata = {
        test3: "test-metadata-3",
      };
      await serverStorage.updateMetadata(
        uploadedFile,
        updatedMetadata2
      );
      queryAndAssertMetadata(uploadedFile, updatedMetadata2);
    });
  });
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
            data: dataCallback(fileToUploadPath)
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
            data: dataCallback(fileToUploadPath)
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
      });

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;
        it(`should upload a file from ${caseName} using transfer config`, async () => {
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
            data: dataCallback(),
            reference,
            transferConfig: uploadConfig,
          });

          await checkUploadedFileValidity(reference, contentBuffer);
        });

        it(`should upload a file with relative directory from ${caseName} using transfer config`, async () => {
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
            data: dataCallback(),
            reference,
            transferConfig: uploadConfig,
          });

          await checkUploadedFileValidity(reference, contentBuffer);
        });

        it(`should upload a file from ${caseName} with metadata using transfer config`, async () => {
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
            data: dataCallback(),
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

          await checkUploadedFileValidity(reference, contentBuffer,);
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
