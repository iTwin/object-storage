/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { createStubInstance } from "sinon";

import {
  Constants,
  testRelativeDirectoryValidation,
  mockPresignedUrlProvider,
  mockTransferConfigProvider
} from "@itwin/object-storage-tests-unit";

import { S3ClientWrapper } from "../frontend";
import { S3ServerStorage } from "../server";

describe(`${S3ServerStorage.name}`, () => {
  const mockS3ClientWrapper: S3ClientWrapper = createStubInstance(S3ClientWrapper);
  const serverStorage = new S3ServerStorage(
    mockS3ClientWrapper,
    mockPresignedUrlProvider,
    mockTransferConfigProvider
  );

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
});
