/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { randomUUID } from "crypto";
import { createReadStream } from "fs";
import { readFile, rmdir, unlink, writeFile } from "fs/promises";
import { Readable } from "stream";

import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import {
  ClientSideStorage,
  ObjectReference,
  ServerSideStorage,
  streamToBuffer,
  TransferConfig,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { config } from "./Config";
import { checkUploadedFileValidity } from "./Helpers";

use(chaiAsPromised);

const {
  relativeDirectory,
  baseDirectory,
  clientSideStorage,
  serverSideStorage,
} = config;

const testDownloadFolder = "test-download";

const downloadTestCases: {
  caseName: string;
  transferType: TransferType;
  assertion: (response: TransferData, contentBuffer: Buffer) => Promise<void>;
  defineLocalPath: boolean;
}[] = [
  {
    caseName: "Buffer",
    transferType: "buffer",
    assertion: async (response, contentBuffer) => {
      expect(response instanceof Buffer).to.be.true;
      expect(contentBuffer.equals(response as Buffer)).to.be.true;
    },
    defineLocalPath: false,
  },
  {
    caseName: "Stream",
    transferType: "stream",
    assertion: async (response, contentBuffer) => {
      expect(response instanceof Readable).to.be.true;
      const downloadedBuffer = await streamToBuffer(response as Readable);
      expect(contentBuffer.equals(downloadedBuffer)).to.be.true;
    },
    defineLocalPath: false,
  },
  {
    caseName: "path",
    transferType: "local",
    assertion: async (response, contentBuffer) => {
      expect(contentBuffer.equals(await readFile(response as string)));
    },
    defineLocalPath: true,
  },
];

describe(`${ServerSideStorage.name}: ${serverSideStorage.constructor.name}`, () => {
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

  describe(`${serverSideStorage.createBaseDirectory.name}`, () => {
    it("should create base directory", async () => {
      const createBaseDirectoryPromise =
        serverSideStorage.createBaseDirectory(baseDirectory);
      await expect(createBaseDirectoryPromise).to.eventually.be.fulfilled;
    });
  });

  describe(`${serverSideStorage.upload.name}()`, () => {
    const contentBuffer = Buffer.from("server-side-upload-content");
    const fileToUploadPath = "server-side-test.txt";

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
      await writeFile(fileToUploadPath, contentBuffer);
    });

    for (const testCase of uploadTestCases) {
      const { caseName, objectName, dataCallback } = testCase;
      it(`should upload a file from ${caseName} with metadata`, async () => {
        const reference = {
          baseDirectory,
          relativeDirectory,
          objectName,
        };

        const metadata = {
          test: "test-metadata",
        };
        const uploadPromise = serverSideStorage.upload(
          reference,
          dataCallback(),
          metadata
        );
        await expect(uploadPromise).to.eventually.be.fulfilled;

        await checkUploadedFileValidity(reference, contentBuffer, metadata);
      });
    }

    after(async () => {
      await unlink(fileToUploadPath);
    });
  });

  describe(`${serverSideStorage.uploadInMultipleParts.name}()`, () => {
    const contentBuffer = Buffer.from("server-side-multipart-upload-content");
    const fileToUploadPath = "server-side-multipart-test.txt";

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
      await writeFile(fileToUploadPath, contentBuffer);
    });

    for (const testCase of uploadTestCases) {
      const { caseName, objectName, dataCallback } = testCase;
      it(`should upload a file from ${caseName} with metadata`, async () => {
        const reference = {
          baseDirectory,
          relativeDirectory,
          objectName,
        };

        const metadata = {
          test: "test-metadata",
        };
        const uploadPromise = serverSideStorage.uploadInMultipleParts(
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
      await unlink(fileToUploadPath);
    });
  });

  describe(`${serverSideStorage.list.name}()`, () => {
    it("should list objects from upload tests", async () => {
      const references = await serverSideStorage.list({
        baseDirectory,
        relativeDirectory,
      });

      remoteFiles.forEach((name) =>
        expect(references.find((ref) => ref.objectName === name))
      );
    });
  });

  describe(`${serverSideStorage.remove.name}()`, () => {
    it("should remove objects from upload tests", async () => {
      const removePromises = remoteFiles.map(
        (file) =>
          expect(
            serverSideStorage.remove({
              baseDirectory,
              relativeDirectory,
              objectName: file,
            })
          ).to.eventually.be.fulfilled
      );

      await Promise.all(removePromises);
    });
  });

  describe(`${serverSideStorage.exists.name}()`, () => {
    it("should return true if file exists", async () => {
      const reference = {
        baseDirectory,
        relativeDirectory,
        objectName: "exists.txt",
      };
      await serverSideStorage.upload(reference, Buffer.from("test-exists"));

      const exists = await serverSideStorage.exists(reference);
      expect(exists).to.be.true;

      await serverSideStorage.remove(reference);
    });

    it("should return false if file does not exist", async () => {
      const exists = await serverSideStorage.exists({
        baseDirectory,
        relativeDirectory,
        objectName: randomUUID(),
      });

      expect(exists).to.be.false;
    });
  });

  describe(`${serverSideStorage.download.name}()`, () => {
    const contentBuffer = Buffer.from("test-download");

    const reference = {
      baseDirectory,
      relativeDirectory,
      objectName: "file-to-download.txt",
    };

    before(async () => {
      await serverSideStorage.upload(reference, contentBuffer);
    });

    for (const testCase of downloadTestCases) {
      const { caseName, transferType, defineLocalPath, assertion } = testCase;
      it(`should download a file to ${caseName}`, async () => {
        const response = await serverSideStorage.download(
          reference,
          transferType,
          defineLocalPath ? `${testDownloadFolder}/download.txt` : undefined
        );
        await assertion(response, contentBuffer);
      });
    }

    after(async () => {
      await Promise.all([
        serverSideStorage.remove(reference),
        rmdir(testDownloadFolder, { recursive: true }),
      ]);
    });
  });

  describe(`${serverSideStorage.getObjectProperties.name}()`, () => {
    const reference: ObjectReference = {
      baseDirectory,
      relativeDirectory,
      objectName: "test-object-properties.txt",
    };
    const data = Buffer.from("test-properties");

    before(async () => {
      await serverSideStorage.upload(reference, data, {
        test: "test-metadata",
      });
    });

    it("should get correct object properties", async () => {
      const {
        lastModified,
        reference: _reference,
        size,
        metadata,
      } = await serverSideStorage.getObjectProperties(reference);

      expect(Date.now() - lastModified.getTime() < 60 * 1000).to.be.true; // not older than 1 minute
      expect(_reference).to.eql(reference);
      expect(size === data.byteLength);
      expect(metadata?.test).to.be.equal("test-metadata");
    });

    after(async () => {
      await serverSideStorage.remove(reference);
    });
  });

  describe(`${serverSideStorage.updateMetadata.name}()`, () => {
    const reference = {
      baseDirectory,
      relativeDirectory,
      objectName: "update-metadata-test.txt",
    };

    before(async () => {
      await serverSideStorage.upload(reference, Buffer.from("test-metadata"), {
        test: "test-metadata",
      });
    });

    it("should update metadata", async () => {
      const { metadata } = await serverSideStorage.getObjectProperties(
        reference
      );
      expect(metadata?.test).to.be.equal("test-metadata");

      const updateMetadataPromise = serverSideStorage.updateMetadata(
        reference,
        {
          test: "test-metadata-updated",
        }
      );
      await expect(updateMetadataPromise).to.eventually.be.fulfilled;

      const { metadata: metadataUpdated } =
        await serverSideStorage.getObjectProperties(reference);
      expect(metadataUpdated?.test).to.be.equal("test-metadata-updated");
    });

    after(async () => {
      await serverSideStorage.remove(reference);
    });
  });

  describe(`${serverSideStorage.deleteBaseDirectory.name}`, () => {
    it("should delete base directory and its contents", async () => {
      const tempFiles = ["temp-1", "temp-2", "temp-3"];

      await Promise.all(
        tempFiles.map(async (file) =>
          serverSideStorage.upload(
            { baseDirectory, objectName: file },
            Buffer.from(file)
          )
        )
      );

      const deleteBaseDirectoryPromise =
        serverSideStorage.deleteBaseDirectory(baseDirectory);

      await expect(deleteBaseDirectoryPromise).to.eventually.be.fulfilled;

      const existsArray = await Promise.all(
        tempFiles.map(async (file) =>
          serverSideStorage.exists({ baseDirectory, objectName: file })
        )
      );
      existsArray.forEach((exists) => expect(exists).to.be.false);
    });
  });
});

describe(`${ClientSideStorage.name}: ${clientSideStorage.constructor.name}`, () => {
  before(async () => {
    await serverSideStorage.createBaseDirectory(baseDirectory);
  });

  describe("PresignedUrlProvider", () => {
    describe(`${clientSideStorage.upload.name}() & ${serverSideStorage.getUploadUrl.name}()`, () => {
      const contentBuffer = Buffer.from("test-url-upload-content");
      const fileToUploadPath = "client-side-url-test.txt";

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
        await writeFile(fileToUploadPath, contentBuffer);
      });

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;
        it(`should upload a file from ${caseName} with metadata to URL`, async () => {
          const reference = {
            baseDirectory,
            relativeDirectory,
            objectName,
          };

          const uploadUrl = await serverSideStorage.getUploadUrl(reference);

          const metadata = {
            test: "test-metadata",
          };
          const uploadPromise = clientSideStorage.upload({
            url: uploadUrl,
            data: dataCallback(),
            metadata,
          });
          await expect(uploadPromise).to.eventually.be.fulfilled;

          await checkUploadedFileValidity(reference, contentBuffer, metadata);
        });
      }

      after(async () => {
        const removePromises = [
          testUploadUrlLocalFile,
          testUploadUrlBufferFile,
          testUploadUrlStreamFile,
        ].map(async (file) =>
          serverSideStorage.remove({
            baseDirectory,
            relativeDirectory,
            objectName: file,
          })
        );

        await Promise.all([...removePromises, unlink(fileToUploadPath)]);
      });
    });

    describe(`${serverSideStorage.download.name}() & ${serverSideStorage.getDownloadUrl.name}()`, () => {
      const contentBuffer = Buffer.from("test-download-url");

      const reference = {
        baseDirectory,
        relativeDirectory,
        objectName: "file-to-download-from-url.txt",
      };

      before(async () => {
        await serverSideStorage.upload(reference, contentBuffer);
      });

      for (const testCase of downloadTestCases) {
        const { caseName, transferType, defineLocalPath, assertion } = testCase;
        it(`should download a file to ${caseName} from URL`, async () => {
          const downloadUrl = await serverSideStorage.getDownloadUrl(reference);

          const response = await clientSideStorage.download({
            url: downloadUrl,
            transferType,
            localPath: defineLocalPath
              ? `${testDownloadFolder}/download-url.txt`
              : undefined,
          });

          await assertion(response, contentBuffer);
        });
      }

      after(async () => {
        await Promise.all([
          serverSideStorage.remove(reference),
          rmdir(testDownloadFolder, { recursive: true }),
        ]);
      });
    });
  });

  describe("TransferConfigProvider", () => {
    describe(`${clientSideStorage.upload.name}() & ${serverSideStorage.getUploadConfig.name}()`, () => {
      const contentBuffer = Buffer.from("test-config-upload-content");
      const fileToUploadPath = "client-side-config-test.txt";

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
        },
      ];

      before(async () => {
        await writeFile(fileToUploadPath, contentBuffer);
        uploadConfig = await serverSideStorage.getUploadConfig({
          baseDirectory,
          relativeDirectory,
        });
      });

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;
        it(`should upload a file from ${caseName} with metadata using transfer config`, async () => {
          const reference = {
            baseDirectory,
            relativeDirectory,
            objectName,
          };

          const metadata = {
            test: "test-metadata",
          };
          const uploadPromise = clientSideStorage.upload({
            data: dataCallback(),
            reference,
            transferConfig: uploadConfig,
            metadata,
          });
          await expect(uploadPromise).to.eventually.be.fulfilled;

          await checkUploadedFileValidity(reference, contentBuffer, metadata);
        });
      }

      after(async () => {
        const removePromises = [
          testUploadConfigLocalFile,
          testUploadConfigBufferFile,
          testUploadConfigStreamFile,
        ].map(async (file) =>
          serverSideStorage.remove({
            baseDirectory,
            relativeDirectory,
            objectName: file,
          })
        );

        await Promise.all([...removePromises, unlink(fileToUploadPath)]);
      });
    });

    describe(`${clientSideStorage.uploadInMultipleParts.name}() & ${serverSideStorage.getUploadConfig.name}()`, () => {
      const contentBuffer = Buffer.from("test-config-multipart-upload-content");
      const fileToUploadPath = "client-side-config-test-multipart.txt";

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
        },
      ];

      before(async () => {
        await writeFile(fileToUploadPath, contentBuffer);
        uploadConfig = await serverSideStorage.getUploadConfig({
          baseDirectory,
          relativeDirectory,
        });
      });

      for (const testCase of uploadTestCases) {
        const { caseName, objectName, dataCallback } = testCase;
        it(`should upload a file from ${caseName} with metadata using transfer config`, async () => {
          const reference = {
            baseDirectory,
            relativeDirectory,
            objectName,
          };

          const metadata = {
            test: "test-metadata",
          };
          const multipartUploadPromise =
            clientSideStorage.uploadInMultipleParts({
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
        const removePromises = [
          testMultipartUploadConfigLocalFile,
          testMultipartUploadConfigStreamFile,
        ].map(async (file) =>
          serverSideStorage.remove({
            baseDirectory,
            relativeDirectory,
            objectName: file,
          })
        );

        await Promise.all([...removePromises, unlink(fileToUploadPath)]);
      });
    });

    describe(`${clientSideStorage.download.name}() & ${serverSideStorage.getDownloadConfig.name}()`, () => {
      const contentBuffer = Buffer.from("test-download-config");

      const reference = {
        baseDirectory,
        relativeDirectory,
        objectName: "file-to-download-with-config.txt",
      };

      let downloadConfig: TransferConfig;

      before(async () => {
        await serverSideStorage.upload(reference, contentBuffer);
        downloadConfig = await serverSideStorage.getDownloadConfig({
          baseDirectory,
          relativeDirectory,
        });
      });

      for (const testCase of downloadTestCases) {
        const { caseName, transferType, defineLocalPath, assertion } = testCase;
        it(`should download a file to ${caseName} using transfer config`, async () => {
          const response = await clientSideStorage.download({
            reference,
            transferConfig: downloadConfig,
            transferType,
            localPath: defineLocalPath
              ? `${testDownloadFolder}/download-config.txt`
              : undefined,
          });

          await assertion(response, contentBuffer);
        });
      }

      after(async () => {
        await Promise.all([
          serverSideStorage.remove(reference),
          rmdir(testDownloadFolder, { recursive: true }),
        ]);
      });
    });
  });
});
