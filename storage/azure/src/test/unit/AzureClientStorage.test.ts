/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import {
  Constants,
  testRelativeDirectoryValidation,
} from "@itwin/object-storage-tests-unit";

import { AzureClientStorage } from "../../client";
import {
  AzureTransferConfig,
  BlockBlobClientWrapperFactory,
} from "../../frontend";

describe(`${AzureClientStorage.name}`, () => {
  const clientStorage = new AzureClientStorage(
    new BlockBlobClientWrapperFactory()
  );

  const testTransferConfig: AzureTransferConfig = {
    expiration: new Date(),
    baseUrl: "testBaseUrl",
    authentication: "testAuthentication",
  };
  const commonParams = {
    reference: Constants.invalidObjectReference,
    transferConfig: testTransferConfig,
  };

  describe(`${clientStorage.download.name}()`, () => {
    it("should throw if relativeDirectory is invalid (buffer)", async () => {
      await testRelativeDirectoryValidation(async () =>
        clientStorage.download({
          transferType: "buffer",
          ...commonParams,
        })
      );
    });

    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(async () =>
        clientStorage.download({
          transferType: "stream",
          ...commonParams,
        })
      );
    });

    it("should throw if relativeDirectory is invalid (path)", async () => {
      await testRelativeDirectoryValidation(async () =>
        clientStorage.download({
          transferType: "local",
          localPath: "testLocalPath",
          ...commonParams,
        })
      );
    });
  });

  describe(`${clientStorage.upload.name}()`, async () => {
    it("should throw if relativeDirectory is invalid (buffer)", async () => {
      await testRelativeDirectoryValidation(async () =>
        clientStorage.upload({
          data: Buffer.from("testPayload"),
          ...commonParams,
        })
      );
    });

    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(async () =>
        clientStorage.upload({
          data: Readable.from("testPayload"),
          ...commonParams,
        })
      );
    });

    it("should throw if relativeDirectory is invalid (path)", async () => {
      await testRelativeDirectoryValidation(async () =>
        clientStorage.upload({
          data: "testPath",
          ...commonParams,
        })
      );
    });
  });

  describe(`${clientStorage.uploadInMultipleParts.name}()`, async () => {
    it("should throw if relativeDirectory is invalid (stream)", async () => {
      await testRelativeDirectoryValidation(async () =>
        clientStorage.uploadInMultipleParts({
          data: Readable.from("testPayload"),
          ...commonParams,
        })
      );
    });

    it("should throw if relativeDirectory is invalid (path)", async () => {
      await testRelativeDirectoryValidation(async () =>
        clientStorage.uploadInMultipleParts({
          data: "testPath",
          ...commonParams,
        })
      );
    });
  });
});
