/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomUUID } from "crypto";
import { createReadStream, promises } from "fs";

import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {
  BaseDirectory,
  ClientStorage,
  ObjectDirectory,
  ObjectReference,
  ServerStorage,
  TransferConfig,
} from "@itwin/object-storage-core";

import { config } from "./Config";
import {
  assertBuffer,
  assertLocalFile,
  assertStream,
  checkUploadedFileValidity,
  TestDirectoryManager,
} from "./Helpers";

use(chaiAsPromised);

const { clientStorage, frontendStorage, serverStorage } = config;

const testDownloadFolder = "test-download";

const testDirectoryManager = new TestDirectoryManager();

describe(`${ServerStorage.name}: ${serverStorage.constructor.name}`, () => {
  let testDirectory: ObjectDirectory;

  const testUploadBufferFile = "test-upload-buffer.txt";
  const testUploadStreamFile = "test-upload-stream.txt";
  const testUploadLocalFile = "test-upload-local.txt";
  const testMultipartUploadLocalFile = "test-multipart-upload-local.txt";
  const testMultipartUploadStreamFile = "test-multipart-upload-stream.txt";

  const remoteFiles = [
    testUploadLocalFile,
    testUploadBufferFile,
    testUploadStreamFile,
    testMultipartUploadLocalFile,
    testMultipartUploadStreamFile,
  ];

  before(async () => {
    testDirectory = await testDirectoryManager.createNewDirectory();
  });

  after(async () => testDirectoryManager.purgeCreatedDirectories());

  describe(`${serverStorage.createBaseDirectory.name}()`, () => {
    it("should create directory", async () => {
      const directoryToCreate: BaseDirectory = {
        baseDirectory: "test-create-directory",
      };
      try {
        const createDirectoryPromise =
          serverStorage.createBaseDirectory(directoryToCreate);
        await expect(createDirectoryPromise).to.eventually.be.fulfilled;

        const doesDirectoryExist = await serverStorage.baseDirectoryExists(
          directoryToCreate
        );
        expect(doesDirectoryExist).to.be.equal(true);
      } finally {
        await serverStorage.deleteBaseDirectory(directoryToCreate);
      }
    });
  });

  describe(`${serverStorage.upload.name}()`, () => {
    const contentBuffer = Buffer.from("server-upload-content");
    const fileToUploadPath = "server-test.txt";

    const uploadTestCases = [
      {
        caseName: "Buffer",
        objectName: testUploadBufferFile,
        dataCallback: () => contentBuffer,
      },
      {
        caseName: "Stream",
        objectName: testUploadStreamFile,
        dataCallback: () => createReadStream(fileToUploadPath),
      },
      {
        caseName: "path",
        objectName: testUploadLocalFile,
        dataCallback: () => fileToUploadPath,
      },
    ];

    before(async () => {
      await promises.writeFile(fileToUploadPath, contentBuffer);
    });

    for (const testCase of uploadTestCases) {
      const { caseName, objectName, dataCallback } = testCase;
      it(`should upload a file from ${caseName} with metadata`, async () => {
        const reference = {
          ...testDirectory,
          objectName,
        };

        const metadata = {
          test: "test-metadata",
        };
        const uploadPromise = serverStorage.upload(
          reference,
          dataCallback(),
          metadata
        );
        await expect(uploadPromise).to.eventually.be.fulfilled;

        await checkUploadedFileValidity(reference, contentBuffer, metadata);
      });
    }

    after(async () => {
      await promises.unlink(fileToUploadPath);
    });
  });

  describe(`${serverStorage.uploadInMultipleParts.name}()`, () => {
    const contentBuffer = Buffer.from("server-multipart-upload-content");
    const fileToUploadPath = "server-multipart-test.txt";

    const uploadTestCases = [
      {
        caseName: "Stream",
        objectName: testMultipartUploadStreamFile,
        dataCallback: () => createReadStream(fileToUploadPath),
      },
      {
        caseName: "path",
        objectName: testMultipartUploadLocalFile,
        dataCallback: () => fileToUploadPath,
      },
    ];

    before(async () => {
      await promises.writeFile(fileToUploadPath, contentBuffer);
    });

    for (const testCase of uploadTestCases) {
      const { caseName, objectName, dataCallback } = testCase;
      it(`should upload a file from ${caseName} with metadata`, async () => {
        const reference = {
          ...testDirectory,
          objectName,
        };

        const metadata = {
          test: "test-metadata",
        };
        const uploadPromise = serverStorage.uploadInMultipleParts(
          reference,
          dataCallback(),
          {
            metadata,
          }
        );
        await expect(uploadPromise).to.eventually.be.fulfilled;

        await checkUploadedFileValidity(reference, contentBuffer, metadata);
      });
    }

    after(async () => {
      await promises.unlink(fileToUploadPath);
    });
  });

  describe(`${serverStorage.list.name}()`, () => {
    it("should list objects from upload tests", async () => {
      const references = await serverStorage.list(testDirectory);

      remoteFiles.forEach((name) =>
        expect(references.find((ref) => ref.objectName === name))
      );
    });
  });

  describe(`${serverStorage.deleteBaseDirectory.name}()`, () => {
    it("should delete directory with files", async () => {
      const tempDirectory: ObjectDirectory =
        await testDirectoryManager.createNewDirectory();
      const tempFiles = ["temp-1", "temp-2", "temp-3"];

      await Promise.all(
        tempFiles.map(async (file) =>
          serverStorage.upload(
            { ...tempDirectory, objectName: file },
            Buffer.from(file)
          )
        )
      );

      const deleteDirectoryPromise =
        serverStorage.deleteBaseDirectory(tempDirectory);

      await expect(deleteDirectoryPromise).to.eventually.be.fulfilled;

      const doesDirectoryExist = await serverStorage.baseDirectoryExists(
        tempDirectory
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
    it("should delete objects from upload tests", async () => {
      const deletePromises = remoteFiles.map(
        (file) =>
          expect(
            serverStorage.deleteObject({
              ...testDirectory,
              objectName: file,
            })
          ).to.eventually.be.fulfilled
      );

      await Promise.all(deletePromises);
    });

    it("should not throw if file does not exist", async () => {
      const tempDirectory = await testDirectoryManager.createNewDirectory();
      const deletePromise = serverStorage.deleteObject({
        ...tempDirectory,
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
      const tempDirectory: ObjectDirectory =
        await testDirectoryManager.createNewDirectory();

      const testFileToUpload: ObjectReference = {
        ...tempDirectory,
        objectName: "test-delete-object.txt",
      };
      const contentBuffer = Buffer.from("test-delete-object");
      await serverStorage.upload(testFileToUpload, contentBuffer);

      await serverStorage.deleteObject(testFileToUpload);

      const exists = await serverStorage.baseDirectoryExists(tempDirectory);
      expect(exists).to.be.true;
    });
  });

  describe(`${serverStorage.baseDirectoryExists.name}()`, () => {
    it("should return true if base directory exists", async () => {
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
    let reference: ObjectReference;

    before(async () => {
      reference = {
        ...testDirectory,
        objectName: "file-to-download.txt",
      };
      await serverStorage.upload(reference, contentBuffer);
    });

    it("should download a file to buffer", async () => {
      const response = await serverStorage.download(reference, "buffer");
      assertBuffer(response, contentBuffer);
    });

    it("should download a file to stream", async () => {
      const response = await serverStorage.download(reference, "stream");
      await assertStream(response, contentBuffer);
    });

    it("should download a file to path", async () => {
      const response = await serverStorage.download(
        reference,
        "local",
        `${testDownloadFolder}/download.txt`
      );
      await assertLocalFile(response, contentBuffer);
    });

    after(async () => {
      await Promise.all([
        serverStorage.deleteObject(reference),
        promises.rmdir(testDownloadFolder, { recursive: true }),
      ]);
    });
  });

  describe(`${serverStorage.getObjectProperties.name}()`, () => {
    let reference: ObjectReference;
    const data = Buffer.from("test-properties");

    before(async () => {
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
    let reference: ObjectReference;

    before(async () => {
      reference = {
        ...testDirectory,
        objectName: "update-metadata-test.txt",
      };
      await serverStorage.upload(reference, Buffer.from("test-metadata"), {
        test: "test-metadata",
      });
    });

    it("should update metadata", async () => {
      const { metadata } = await serverStorage.getObjectProperties(reference);
      expect(metadata?.test).to.be.equal("test-metadata");

      const updateMetadataPromise = serverStorage.updateMetadata(reference, {
        test: "test-metadata-updated",
      });
      await expect(updateMetadataPromise).to.eventually.be.fulfilled;

      const { metadata: metadataUpdated } =
        await serverStorage.getObjectProperties(reference);
      expect(metadataUpdated?.test).to.be.equal("test-metadata-updated");
    });

    after(async () => {
      await serverStorage.deleteObject(reference);
    });
  });
});

(
  [
    [clientStorage, false],
    [frontendStorage, true],
  ] as [ClientStorage, boolean][]
).forEach(([storage, isFrontend]) => {
  describe(`${ClientStorage.name}: ${storage.constructor.name}`, () => {
    let testDirectory: ObjectDirectory;

    before(async () => {
      testDirectory = await testDirectoryManager.createNewDirectory();
    });

    after(async () => testDirectoryManager.purgeCreatedDirectories());

    describe("PresignedUrlProvider", () => {
      describe(`${storage.upload.name}() & ${serverStorage.getUploadUrl.name}()`, () => {
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
            shouldFailWith: isFrontend
              ? "File uploads are not supported"
              : undefined,
          },
        ];

        before(async () => {
          await promises.writeFile(fileToUploadPath, contentBuffer);
        });

        for (const testCase of uploadTestCases) {
          const { caseName, objectName, dataCallback, shouldFailWith } =
            testCase;
          it(`should ${
            shouldFailWith ? "fail to " : ""
          }upload a file from ${caseName} with metadata to URL`, async () => {
            const reference = {
              ...testDirectory,

              objectName,
            };

            const uploadUrl = await serverStorage.getUploadUrl(reference);

            const metadata = {
              test: "test-metadata",
            };
            const uploadPromise = storage.upload({
              url: uploadUrl,
              data: dataCallback(),
              metadata,
            });
            if (shouldFailWith !== undefined)
              await expect(uploadPromise).to.eventually.be.rejectedWith(
                shouldFailWith
              );
            else {
              await expect(uploadPromise).to.eventually.be.fulfilled;

              await checkUploadedFileValidity(
                reference,
                contentBuffer,
                metadata
              );
            }
          });
        }

        after(async () => {
          const deletePromises = [
            testUploadUrlLocalFile,
            testUploadUrlBufferFile,
            testUploadUrlStreamFile,
          ].map(async (file) =>
            serverStorage.deleteObject({
              ...testDirectory,
              objectName: file,
            })
          );

          await Promise.all([
            ...deletePromises,
            promises.unlink(fileToUploadPath),
          ]);
        });
      });

      describe(`${serverStorage.download.name}() & ${serverStorage.getDownloadUrl.name}()`, () => {
        let reference: ObjectReference;
        const contentBuffer = Buffer.from("test-download-url");

        before(async () => {
          reference = {
            ...testDirectory,
            objectName: "file-to-download-from-url.txt",
          };
          await serverStorage.upload(reference, contentBuffer);
        });

        it(`should download a file to buffer from URL`, async () => {
          const downloadUrl = await serverStorage.getDownloadUrl(reference);
          const response = await storage.download({
            url: downloadUrl,
            transferType: "buffer",
          });
          assertBuffer(response, contentBuffer);
        });

        it(`should download a file to stream from URL`, async () => {
          const downloadUrl = await serverStorage.getDownloadUrl(reference);
          const response = await storage.download({
            url: downloadUrl,
            transferType: "stream",
          });
          await assertStream(response, contentBuffer);
        });

        it(`should ${
          isFrontend ? "fail to " : ""
        }download a file to path from URL`, async () => {
          const downloadUrl = await serverStorage.getDownloadUrl(reference);
          const promise = storage.download({
            url: downloadUrl,
            transferType: "local",
            localPath: `${testDownloadFolder}/download-url.txt`,
          });
          if (isFrontend)
            await expect(promise).to.eventually.be.rejectedWith(
              "Type 'local' is not supported"
            );
          else await assertLocalFile(await promise, contentBuffer);
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
      describe(`${storage.upload.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
        const contentBuffer = Buffer.from("test-config-upload-content");
        const fileToUploadPath = "client-config-test.txt";

        const testUploadConfigLocalFile = "test-upload-config-local.txt";
        const testUploadConfigBufferFile = "test-upload-config-buffer.txt";
        const testUploadConfigStreamFile = "test-upload-config-stream.txt";

        let uploadConfig: TransferConfig;

        const uploadTestCases = [
          {
            caseName: "Buffer",
            objectName: testUploadConfigBufferFile,
            dataCallback: () => contentBuffer,
          },
          {
            caseName: "Stream",
            objectName: testUploadConfigStreamFile,
            dataCallback: () => createReadStream(fileToUploadPath),
          },
          {
            caseName: "path",
            objectName: testUploadConfigLocalFile,
            dataCallback: () => fileToUploadPath,
            shouldFailWith: isFrontend
              ? "File uploads are not supported"
              : undefined,
          },
        ];

        before(async () => {
          await promises.writeFile(fileToUploadPath, contentBuffer);
          uploadConfig = await serverStorage.getUploadConfig({
            ...testDirectory,
          });
        });

        for (const testCase of uploadTestCases) {
          const { caseName, objectName, dataCallback, shouldFailWith } =
            testCase;
          it(`should ${
            shouldFailWith ? "fail to " : ""
          }upload a file from ${caseName} with metadata using transfer config`, async () => {
            const reference = {
              ...testDirectory,
              objectName,
            };

            const metadata = {
              test: "test-metadata",
            };
            const uploadPromise = storage.upload({
              data: dataCallback(),
              reference,
              transferConfig: uploadConfig,
              metadata,
            });
            if (shouldFailWith !== undefined)
              await expect(uploadPromise).to.eventually.be.rejectedWith(
                shouldFailWith
              );
            else {
              await expect(uploadPromise).to.eventually.be.fulfilled;
              await checkUploadedFileValidity(
                reference,
                contentBuffer,
                metadata
              );
            }
          });
        }

        after(async () => {
          const deletePromises = [
            testUploadConfigLocalFile,
            testUploadConfigBufferFile,
            testUploadConfigStreamFile,
          ].map(async (file) =>
            serverStorage.deleteObject({
              ...testDirectory,
              objectName: file,
            })
          );

          await Promise.all([
            ...deletePromises,
            promises.unlink(fileToUploadPath),
          ]);
        });
      });

      describe(`${storage.uploadInMultipleParts.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
        const contentBuffer = Buffer.from(
          "test-config-multipart-upload-content"
        );
        const fileToUploadPath = "client-config-test-multipart.txt";

        const testMultipartUploadConfigLocalFile =
          "test-multipart-upload-config-local.txt";
        const testMultipartUploadConfigStreamFile =
          "test-multipart-upload-config-stream.txt";

        let uploadConfig: TransferConfig;

        const uploadTestCases = [
          {
            caseName: "Stream",
            objectName: testMultipartUploadConfigStreamFile,
            dataCallback: () => createReadStream(fileToUploadPath),
          },
          {
            caseName: "path",
            objectName: testMultipartUploadConfigLocalFile,
            dataCallback: () => fileToUploadPath,
            shouldFailWith: isFrontend
              ? "File uploads are not supported"
              : undefined,
          },
        ];

        before(async () => {
          await promises.writeFile(fileToUploadPath, contentBuffer);
          uploadConfig = await serverStorage.getUploadConfig({
            ...testDirectory,
          });
        });

        for (const testCase of uploadTestCases) {
          const { caseName, objectName, dataCallback, shouldFailWith } =
            testCase;
          it(`should ${
            shouldFailWith ? "fail to " : ""
          }upload a file from ${caseName} with metadata using transfer config`, async () => {
            const reference = {
              ...testDirectory,
              objectName,
            };

            const metadata = {
              test: "test-metadata",
            };
            const multipartUploadPromise = storage.uploadInMultipleParts({
              data: dataCallback(),
              reference,
              transferConfig: uploadConfig,
              options: { metadata },
            });
            if (shouldFailWith !== undefined)
              await expect(
                multipartUploadPromise
              ).to.eventually.be.rejectedWith(shouldFailWith);
            else {
              await expect(multipartUploadPromise).to.eventually.be.fulfilled;
              await checkUploadedFileValidity(
                reference,
                contentBuffer,
                metadata
              );
            }
          });
        }

        after(async () => {
          const deletePromises = [
            testMultipartUploadConfigLocalFile,
            testMultipartUploadConfigStreamFile,
          ].map(async (file) =>
            serverStorage.deleteObject({
              ...testDirectory,
              objectName: file,
            })
          );

          await Promise.all([
            ...deletePromises,
            promises.unlink(fileToUploadPath),
          ]);
        });
      });

      describe(`${storage.download.name}() & ${serverStorage.getDownloadConfig.name}()`, () => {
        let reference: ObjectReference;
        let downloadConfig: TransferConfig;
        const contentBuffer = Buffer.from("test-download-config");

        before(async () => {
          reference = {
            ...testDirectory,
            objectName: "file-to-download-with-config.txt",
          };
          await serverStorage.upload(reference, contentBuffer);
          downloadConfig = await serverStorage.getDownloadConfig({
            ...testDirectory,
          });
        });

        it(`should download a file to buffer using transfer config`, async () => {
          const response = await storage.download({
            reference,
            transferConfig: downloadConfig,
            transferType: "buffer",
          });
          assertBuffer(response, contentBuffer);
        });

        it(`should download a file to stream using transfer config`, async () => {
          const response = await storage.download({
            reference,
            transferConfig: downloadConfig,
            transferType: "stream",
          });
          await assertStream(response, contentBuffer);
        });

        it(`should ${
          isFrontend ? "fail to " : ""
        }download a file to path using transfer config`, async () => {
          const promise = storage.download({
            reference,
            transferConfig: downloadConfig,
            transferType: "local",
            localPath: `${testDownloadFolder}/download-config.txt`,
          });
          if (isFrontend)
            await expect(promise).to.eventually.be.rejectedWith(
              "Type 'local' is not supported"
            );
          else await assertLocalFile(await promise, contentBuffer);
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
});
