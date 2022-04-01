/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomUUID } from "crypto";
import { createReadStream, promises } from "fs";
import { Readable } from "stream";

import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {
  ClientStorage,
  MultipartUploadData,
  ObjectDirectory,
  ObjectReference,
  ServerStorage,
  streamToBuffer,
  TransferConfig,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { config } from "./Config";
import { checkUploadedFileValidity, TestDirectoryManager } from "./Helpers";

use(chaiAsPromised);

const { clientStorage, serverStorage, frontendStorage } = config;

const testDownloadFolder = "test-download";

function getDownloadTestCases(isFrontend: boolean): {
  caseName: string;
  transferType: TransferType;
  assertion: (
    response: Promise<TransferData>,
    contentBuffer: Buffer
  ) => Promise<void>;
  defineLocalPath: boolean;
}[] {
  return [
    {
      caseName: "Buffer",
      transferType: "buffer",
      assertion: async (promise, contentBuffer) => {
        const response = await promise;
        expect(response instanceof Buffer).to.be.true;
        expect(contentBuffer.equals(response as Buffer)).to.be.true;
      },
      defineLocalPath: false,
    },
    {
      caseName: "Stream",
      transferType: "stream",
      assertion: async (promise, contentBuffer) => {
        const response = await promise;
        expect(response instanceof Readable).to.be.true;
        const downloadedBuffer = await streamToBuffer(response as Readable);
        expect(contentBuffer.equals(downloadedBuffer)).to.be.true;
      },
      defineLocalPath: false,
    },
    {
      caseName: "path",
      transferType: "local",
      assertion: isFrontend
        ? async (promise) => {
            await expect(promise).to.eventually.be.rejectedWith(
              "Type 'local' is not supported"
            );
          }
        : async (promise, contentBuffer) => {
            expect(
              contentBuffer.equals(
                await promises.readFile((await promise) as string)
              )
            );
          },
      defineLocalPath: true,
    },
  ];
}
const downloadTestCases = getDownloadTestCases(false);
const frontendDownloadTestCases = getDownloadTestCases(true);

function getUploadTestCases(
  isFrontend: boolean,
  fileNamePrefix: string,
  fileToUploadPath: string,
  contentBuffer: Buffer
): {
  caseName: string;
  objectName: string;
  dataCallback: () => TransferData;
  expectFailReason?: string;
}[] {
  return [
    {
      caseName: "Buffer",
      objectName: `${fileNamePrefix}-buffer.txt`,
      dataCallback: () => contentBuffer,
    },
    {
      caseName: "Stream",
      objectName: `${fileNamePrefix}-stream.txt`,
      dataCallback: () => createReadStream(fileToUploadPath),
    },
    {
      caseName: "path",
      objectName: `${fileNamePrefix}-local.txt`,
      dataCallback: () => fileToUploadPath,
      expectFailReason: isFrontend
        ? "File uploads are not supported"
        : undefined,
    },
  ];
}

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

  describe(`${serverStorage.create.name}()`, () => {
    it("should create directory", async () => {
      const directoryToCreate = {
        baseDirectory: "test-create-directory",
      };
      try {
        const createDirectoryPromise = serverStorage.create(directoryToCreate);
        await expect(createDirectoryPromise).to.eventually.be.fulfilled;

        const doesDirectoryExist = await serverStorage.exists(
          directoryToCreate
        );
        expect(doesDirectoryExist).to.be.equal(true);
      } finally {
        await serverStorage.delete(directoryToCreate);
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

  describe(`${serverStorage.delete.name}()`, () => {
    it("should delete objects from upload tests", async () => {
      const deletePromises = remoteFiles.map(
        (file) =>
          expect(
            serverStorage.delete({
              ...testDirectory,
              objectName: file,
            })
          ).to.eventually.be.fulfilled
      );

      await Promise.all(deletePromises);
    });
  });

  describe(`${serverStorage.exists.name}()`, () => {
    it("should return true if file exists", async () => {
      const reference = {
        ...testDirectory,
        objectName: "exists.txt",
      };
      await serverStorage.upload(reference, Buffer.from("test-exists"));

      const exists = await serverStorage.exists(reference);
      expect(exists).to.be.true;

      await serverStorage.delete(reference);
    });

    it("should return false if file does not exist", async () => {
      const exists = await serverStorage.exists({
        ...testDirectory,
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

    for (const testCase of downloadTestCases) {
      const { caseName, transferType, defineLocalPath, assertion } = testCase;
      it(`should download a file to ${caseName}`, async () => {
        const downloadPromise = serverStorage.download(
          reference,
          transferType,
          defineLocalPath ? `${testDownloadFolder}/download.txt` : undefined
        );
        await assertion(downloadPromise, contentBuffer);
      });
    }

    after(async () => {
      await Promise.all([
        serverStorage.delete(reference),
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
      await serverStorage.delete(reference);
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
      await serverStorage.delete(reference);
    });
  });

  describe(`${serverStorage.delete.name}`, () => {
    it("should delete directory", async () => {
      const tempFiles = ["temp-1", "temp-2", "temp-3"];

      await Promise.all(
        tempFiles.map(async (file) =>
          serverStorage.upload(
            { ...testDirectory, objectName: file },
            Buffer.from(file)
          )
        )
      );

      const deleteDirectoryPromise = serverStorage.delete(testDirectory);

      await expect(deleteDirectoryPromise).to.eventually.be.fulfilled;

      const doesDirectoryExist = await serverStorage.exists(testDirectory);
      expect(doesDirectoryExist).to.be.equal(false);
    });
  });
});

(
  [
    [clientStorage, downloadTestCases, false],
    [frontendStorage, frontendDownloadTestCases, true],
  ] as [ClientStorage, ReturnType<typeof getDownloadTestCases>, boolean][]
).forEach(([storage, specificDownloadTestCases, isFrontend]) => {
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

        const uploadTestCases = getUploadTestCases(
          isFrontend,
          "test-upload-url",
          fileToUploadPath,
          contentBuffer
        );

        before(async () => {
          await promises.writeFile(fileToUploadPath, contentBuffer);
        });

        for (const testCase of uploadTestCases) {
          const { caseName, objectName, dataCallback, expectFailReason } =
            testCase;
          it(`should${
            expectFailReason ? " fail to" : ""
          } upload a file from ${caseName} with metadata to URL`, async () => {
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
            if (expectFailReason)
              await expect(uploadPromise).to.eventually.be.rejectedWith(
                expectFailReason
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
          const deletePromises = uploadTestCases.map(async (testCase) =>
            serverStorage.delete({
              ...testDirectory,
              objectName: testCase.objectName,
            })
          );

          await Promise.all([
            ...deletePromises,
            promises.unlink(fileToUploadPath),
          ]);
        });
      });

      describe(`${storage.download.name}() & ${serverStorage.getDownloadUrl.name}()`, () => {
        let reference: ObjectReference;
        const contentBuffer = Buffer.from("test-download-url");

        before(async () => {
          reference = {
            ...testDirectory,
            objectName: "file-to-download-from-url.txt",
          };
          await serverStorage.upload(reference, contentBuffer);
        });

        for (const testCase of specificDownloadTestCases) {
          const { caseName, transferType, defineLocalPath, assertion } =
            testCase;
          it(`should download a file to ${caseName} from URL`, async () => {
            const downloadUrl = await serverStorage.getDownloadUrl(reference);

            const downloadPromise = storage.download({
              url: downloadUrl,
              transferType,
              localPath: defineLocalPath
                ? `${testDownloadFolder}/download-url.txt`
                : undefined,
            });

            await assertion(downloadPromise, contentBuffer);
          });
        }

        after(async () => {
          await Promise.all([
            serverStorage.delete(reference),
            promises.rmdir(testDownloadFolder, { recursive: true }),
          ]);
        });
      });
    });

    describe("TransferConfigProvider", () => {
      describe(`${storage.upload.name}() & ${serverStorage.getUploadConfig.name}()`, () => {
        const contentBuffer = Buffer.from("test-config-upload-content");
        const fileToUploadPath = "client-config-test.txt";

        let uploadConfig: TransferConfig;

        const uploadTestCases = getUploadTestCases(
          isFrontend,
          "test-upload-config",
          fileToUploadPath,
          contentBuffer
        );

        before(async () => {
          await promises.writeFile(fileToUploadPath, contentBuffer);
          uploadConfig = await serverStorage.getUploadConfig({
            ...testDirectory,
          });
        });

        for (const testCase of uploadTestCases) {
          const { caseName, objectName, dataCallback, expectFailReason } =
            testCase;
          it(`should${
            expectFailReason ? " fail to" : ""
          } upload a file from ${caseName} with metadata using transfer config`, async () => {
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
            if (expectFailReason)
              await expect(uploadPromise).to.eventually.be.rejectedWith(
                expectFailReason
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
          const deletePromises = uploadTestCases
            .filter((testCase) => testCase.expectFailReason === undefined)
            .map(async (testCase) =>
              serverStorage.delete({
                ...testDirectory,
                objectName: testCase.objectName,
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
            dataCallback: (() =>
              createReadStream(fileToUploadPath)) as () => MultipartUploadData,
          },
        ];
        if (!isFrontend)
          uploadTestCases.push({
            caseName: "path",
            objectName: testMultipartUploadConfigLocalFile,
            dataCallback: () => fileToUploadPath,
          });

        before(async () => {
          await promises.writeFile(fileToUploadPath, contentBuffer);
          uploadConfig = await serverStorage.getUploadConfig({
            ...testDirectory,
          });
        });

        for (const testCase of uploadTestCases) {
          const { caseName, objectName, dataCallback } = testCase;
          it(`should upload a file from ${caseName} with metadata using transfer config`, async () => {
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
            await expect(multipartUploadPromise).to.eventually.be.fulfilled;

            await checkUploadedFileValidity(reference, contentBuffer, metadata);
          });
        }

        after(async () => {
          const deletePromises = [
            testMultipartUploadConfigLocalFile,
            testMultipartUploadConfigStreamFile,
          ].map(async (file) =>
            serverStorage.delete({
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

        for (const testCase of specificDownloadTestCases) {
          const { caseName, transferType, defineLocalPath, assertion } =
            testCase;

          it(`should download a file to ${caseName} using transfer config`, async () => {
            const downloadPromise = storage.download({
              reference,
              transferConfig: downloadConfig,
              transferType,
              localPath: defineLocalPath
                ? `${testDownloadFolder}/download-config.txt`
                : undefined,
            });

            await assertion(downloadPromise, contentBuffer);
          });
        }

        after(async () => {
          await Promise.all([
            serverStorage.delete(reference),
            promises.rmdir(testDownloadFolder, { recursive: true }),
          ]);
        });
      });
    });
  });
});

// describe(`${ClientStorage.name}: ${frontendStorage.constructor.name}`, () => {
//   // let testDirectory: ObjectDirectory;

//   before(async () => {
//     // testDirectory = await testDirectoryManager.createNewDirectory();
//   });

//   after(async () => testDirectoryManager.purgeCreatedDirectories());

//   describe("PresignedUrlProvider", () => {
//     describe(`${clientStorage.upload.name}() & ${serverStorage.getUploadUrl.name}()`, () => {
//       const contentBuffer = Buffer.from("test-url-upload-content");
//       const fileToUploadPath = "client-url-test.txt";

//       const testUploadUrlLocalFile = "test-upload-url-local.txt";
//       const testUploadUrlBufferFile = "test-upload-url-buffer.txt";
//       const testUploadUrlStreamFile = "test-upload-url-stream.txt";

//       testPresignedUrlUpload(
//         contentBuffer,
//         fileToUploadPath,
//         frontendStorage,
//         testDirectoryManager,
//         [
//           {
//             caseName: "Buffer",
//             objectName: testUploadUrlBufferFile,
//             dataCallback: () => contentBuffer,
//           },
//           {
//             caseName: "Stream",
//             objectName: testUploadUrlStreamFile,
//             dataCallback: () => createReadStream(fileToUploadPath),
//           },
//           {
//             caseName: "path",
//             objectName: testUploadUrlLocalFile,
//             dataCallback: () => fileToUploadPath,
//             rejectedWith: [Error, "File uploads are not supported"],
//           },
//         ]
//       );
//     });
//   });
// });
