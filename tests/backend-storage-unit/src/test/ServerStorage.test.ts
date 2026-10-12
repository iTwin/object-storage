/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { ObjectReference, ServerStorage } from "@itwin/object-storage-core";

import { config } from "./Config";
import { Constants } from "./Constants";
import {
  testBaseDirectoryValidation,
  testObjectNameValidation,
  testRelativeDirectoryValidation,
} from "./test-templates/CommonTests";

const { serverStorage } = config;

describe(`${ServerStorage.name}: ${serverStorage.constructor.name}`, () => {
  [
    {
      name: serverStorage.createBaseDirectory.name,
      call: (baseDirectory: string) =>
        serverStorage.createBaseDirectory({ baseDirectory }),
    },
    {
      name: serverStorage.deleteBaseDirectory.name,
      call: (baseDirectory: string) =>
        serverStorage.deleteBaseDirectory({ baseDirectory }),
    },
    {
      name: serverStorage.baseDirectoryExists.name,
      call: (baseDirectory: string) =>
        serverStorage.baseDirectoryExists({ baseDirectory }),
    },
    {
      name: serverStorage.listObjects.name,
      call: (baseDirectory: string) =>
        serverStorage.listObjects({ baseDirectory }),
    },
    {
      name: serverStorage.getListObjectsPagedIterator.name,
      call: (baseDirectory: string) =>
        serverStorage.getListObjectsPagedIterator({ baseDirectory }, 10),
    },
    {
      name: serverStorage.getDownloadConfig.name,
      call: (baseDirectory: string) =>
        serverStorage.getDownloadConfig({ baseDirectory }),
    },
    {
      name: serverStorage.getUploadConfig.name,
      call: (baseDirectory: string) =>
        serverStorage.getUploadConfig({ baseDirectory }),
    },
    {
      name: serverStorage.getDirectoryAccessConfig.name,
      call: (baseDirectory: string) =>
        serverStorage.getDirectoryAccessConfig({ baseDirectory }),
    },
  ].forEach((testCase) => {
    describe(`${testCase.name}()`, () => {
      it("should throw if baseDirectory is invalid", async () => {
        await testBaseDirectoryValidation(testCase.call);
      });
    });
  });

  describe("ObjectReference validation", () => {
    const otherReference = {
      baseDirectory: "testBaseDirectory",
      objectName: "testObjectName",
    };
    const referenceCases: {
      name: string;
      call: (reference: ObjectReference) => Promise<unknown>;
    }[] = [
      {
        name: serverStorage.download.name,
        call: async (reference) => serverStorage.download(reference, "buffer"),
      },
      {
        name: serverStorage.upload.name,
        call: async (reference) =>
          serverStorage.upload(reference, Buffer.from("testPayload")),
      },
      {
        name: serverStorage.uploadInMultipleParts.name,
        call: async (reference) =>
          serverStorage.uploadInMultipleParts(
            reference,
            Readable.from("testPayload")
          ),
      },
      {
        name: serverStorage.deleteObject.name,
        call: async (reference) => serverStorage.deleteObject(reference),
      },
      {
        name: serverStorage.objectExists.name,
        call: async (reference) => serverStorage.objectExists(reference),
      },
      {
        name: serverStorage.updateMetadata.name,
        call: async (reference) => serverStorage.updateMetadata(reference, {}),
      },
      {
        name: serverStorage.getObjectProperties.name,
        call: async (reference) => serverStorage.getObjectProperties(reference),
      },
      {
        name: serverStorage.getDownloadUrl.name,
        call: async (reference) => serverStorage.getDownloadUrl(reference),
      },
      {
        name: serverStorage.getUploadUrl.name,
        call: async (reference) => serverStorage.getUploadUrl(reference),
      },
      {
        name: `${serverStorage.copyObject.name} (source)`,
        call: async (reference) =>
          serverStorage.copyObject(serverStorage, reference, otherReference),
      },
      {
        name: `${serverStorage.copyObject.name} (target)`,
        call: async (reference) =>
          serverStorage.copyObject(serverStorage, otherReference, reference),
      },
    ];

    referenceCases.forEach((testCase) => {
      it(`${testCase.name} should throw if objectName is invalid`, async () => {
        await testObjectNameValidation(async () =>
          testCase.call(Constants.invalidObjectNameReference)
        );
      });

      it(`${testCase.name} should throw if baseDirectory is invalid`, async () => {
        await testBaseDirectoryValidation(async (baseDirectory) =>
          testCase.call({ baseDirectory, objectName: "testObjectName" })
        );
      });
    });
  });

  describe(`${serverStorage.copyObject.name}()`, () => {
    const validReference = {
      baseDirectory: "testBaseDirectory",
      objectName: "testObjectName",
    };

    it("should throw if source relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.copyObject(
          serverStorage,
          Constants.invalidObjectReference,
          validReference
        )
      );
    });

    it("should throw if target relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.copyObject(
          serverStorage,
          validReference,
          Constants.invalidObjectReference
        )
      );
    });
  });

  describe(`${serverStorage.download.name}()`, () => {
    it("should throw if relativeDirectory is invalid (buffer)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.download(Constants.invalidObjectReference, "buffer")
      );
    });

    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.download(Constants.invalidObjectReference, "stream")
      );
    });

    it("should throw if relativeDirectory is invalid (path)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.download(
          Constants.invalidObjectReference,
          "local",
          "testLocalPath"
        )
      );
    });
  });

  describe(`${serverStorage.upload.name}()`, () => {
    it("should throw if relativeDirectory is invalid (buffer)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.upload(
          Constants.invalidObjectReference,
          Buffer.from("testPayload")
        )
      );
    });

    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.upload(
          Constants.invalidObjectReference,
          Readable.from("testPayload")
        )
      );
    });

    it("should throw if relativeDirectory is invalid (path)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.upload(Constants.invalidObjectReference, "testLocalPath")
      );
    });
  });

  describe(`${serverStorage.uploadInMultipleParts.name}()`, () => {
    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.uploadInMultipleParts(
          Constants.invalidObjectReference,
          Readable.from("testPayload")
        )
      );
    });

    it("should throw if relativeDirectory is invalid (path)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.uploadInMultipleParts(
          Constants.invalidObjectReference,
          "testLocalPath"
        )
      );
    });
  });

  describe(`${serverStorage.deleteObject.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.deleteObject(Constants.invalidObjectReference)
      );
    });
  });

  describe(`${serverStorage.objectExists.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.objectExists(Constants.invalidObjectReference)
      );
    });
  });

  describe(`${serverStorage.updateMetadata.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.updateMetadata(Constants.invalidObjectReference, {})
      );
    });
  });

  describe(`${serverStorage.getObjectProperties.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getObjectProperties(Constants.invalidObjectReference)
      );
    });
  });

  describe(`${serverStorage.getDownloadUrl.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getDownloadUrl(Constants.invalidObjectReference)
      );
    });
  });

  describe(`${serverStorage.getUploadUrl.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getUploadUrl(Constants.invalidObjectReference)
      );
    });
  });

  describe(`${serverStorage.getDownloadConfig.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getDownloadConfig(Constants.invalidObjectReference)
      );
    });
  });

  describe(`${serverStorage.getUploadConfig.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getUploadConfig(Constants.invalidObjectReference)
      );
    });
  });

  describe(`${serverStorage.getDirectoryAccessConfig.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getDirectoryAccessConfig(Constants.invalidObjectReference)
      );
    });
  });
});
