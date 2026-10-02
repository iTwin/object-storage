/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { ServerStorage } from "@itwin/object-storage-core";

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
  ].forEach((testCase) => {
    describe(`${testCase.name}()`, () => {
      it("should throw if baseDirectory is invalid", async () => {
        await testBaseDirectoryValidation(testCase.call);
      });
    });
  });

  describe("objectName validation", () => {
    const invalidReference = Constants.invalidObjectNameReference;
    const otherReference = {
      baseDirectory: "testBaseDirectory",
      objectName: "testObjectName",
    };
    [
      {
        name: serverStorage.download.name,
        call: async () => serverStorage.download(invalidReference, "buffer"),
      },
      {
        name: serverStorage.upload.name,
        call: async () =>
          serverStorage.upload(invalidReference, Buffer.from("testPayload")),
      },
      {
        name: serverStorage.uploadInMultipleParts.name,
        call: async () =>
          serverStorage.uploadInMultipleParts(
            invalidReference,
            Readable.from("testPayload"),
          ),
      },
      {
        name: serverStorage.deleteObject.name,
        call: async () => serverStorage.deleteObject(invalidReference),
      },
      {
        name: serverStorage.objectExists.name,
        call: async () => serverStorage.objectExists(invalidReference),
      },
      {
        name: serverStorage.updateMetadata.name,
        call: async () => serverStorage.updateMetadata(invalidReference, {}),
      },
      {
        name: serverStorage.getObjectProperties.name,
        call: async () => serverStorage.getObjectProperties(invalidReference),
      },
      {
        name: serverStorage.getDownloadUrl.name,
        call: async () => serverStorage.getDownloadUrl(invalidReference),
      },
      {
        name: serverStorage.getUploadUrl.name,
        call: async () => serverStorage.getUploadUrl(invalidReference),
      },
      {
        name: `${serverStorage.copyObject.name} (source)`,
        call: async () =>
          serverStorage.copyObject(
            serverStorage,
            invalidReference,
            otherReference,
          ),
      },
      {
        name: `${serverStorage.copyObject.name} (target)`,
        call: async () =>
          serverStorage.copyObject(
            serverStorage,
            otherReference,
            invalidReference,
          ),
      },
    ].forEach((testCase) => {
      it(`${testCase.name} should throw if objectName is invalid`, async () => {
        await testObjectNameValidation(testCase.call);
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
          validReference,
        ),
      );
    });

    it("should throw if target relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.copyObject(
          serverStorage,
          validReference,
          Constants.invalidObjectReference,
        ),
      );
    });
  });

  describe(`${serverStorage.download.name}()`, () => {
    it("should throw if relativeDirectory is invalid (buffer)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.download(Constants.invalidObjectReference, "buffer"),
      );
    });

    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.download(Constants.invalidObjectReference, "stream"),
      );
    });

    it("should throw if relativeDirectory is invalid (path)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.download(
          Constants.invalidObjectReference,
          "local",
          "testLocalPath",
        ),
      );
    });
  });

  describe(`${serverStorage.upload.name}()`, () => {
    it("should throw if relativeDirectory is invalid (buffer)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.upload(
          Constants.invalidObjectReference,
          Buffer.from("testPayload"),
        ),
      );
    });

    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.upload(
          Constants.invalidObjectReference,
          Readable.from("testPayload"),
        ),
      );
    });

    it("should throw if relativeDirectory is invalid (path)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.upload(Constants.invalidObjectReference, "testLocalPath"),
      );
    });
  });

  describe(`${serverStorage.uploadInMultipleParts.name}()`, () => {
    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.uploadInMultipleParts(
          Constants.invalidObjectReference,
          Readable.from("testPayload"),
        ),
      );
    });

    it("should throw if relativeDirectory is invalid (path)", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.uploadInMultipleParts(
          Constants.invalidObjectReference,
          "testLocalPath",
        ),
      );
    });
  });

  describe(`${serverStorage.deleteObject.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.deleteObject(Constants.invalidObjectReference),
      );
    });
  });

  describe(`${serverStorage.objectExists.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.objectExists(Constants.invalidObjectReference),
      );
    });
  });

  describe(`${serverStorage.updateMetadata.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.updateMetadata(Constants.invalidObjectReference, {}),
      );
    });
  });

  describe(`${serverStorage.getObjectProperties.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getObjectProperties(Constants.invalidObjectReference),
      );
    });
  });

  describe(`${serverStorage.getDownloadUrl.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getDownloadUrl(Constants.invalidObjectReference),
      );
    });
  });

  describe(`${serverStorage.getUploadUrl.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getUploadUrl(Constants.invalidObjectReference),
      );
    });
  });

  describe(`${serverStorage.getDownloadConfig.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getDownloadConfig(Constants.invalidObjectReference),
      );
    });
  });

  describe(`${serverStorage.getUploadConfig.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getUploadConfig(Constants.invalidObjectReference),
      );
    });
  });

  describe(`${serverStorage.getDirectoryAccessConfig.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.getDirectoryAccessConfig(
          Constants.invalidObjectReference,
        ),
      );
    });
  });
});
