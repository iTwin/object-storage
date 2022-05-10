/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { createStubInstance } from "sinon";

import {
  S3ClientWrapperFactory,
  S3TransferConfig,
} from "@itwin/object-storage-s3";
import {
  Constants,
  testRelativeDirectoryValidation,
} from "@itwin/object-storage-tests-unit";

import { MinioClientStorage } from "../../client";

describe(`${MinioClientStorage.name}`, () => {
  const mockTransferConfigProvider = createStubInstance(S3ClientWrapperFactory);
  const clientStorage = new MinioClientStorage(mockTransferConfigProvider);

  const testTransferConfig: S3TransferConfig = {
    expiration: new Date(),
    baseUrl: "testBaseUrl",
    authentication: {
      accessKey: "testAccessKey",
      secretKey: "testSecretKey",
      sessionToken: "testSessionToken",
    },
    region: "testRegion",
    bucket: "testBucket",
  };
  const commonParams = {
    reference: Constants.invalidObjectReference,
    transferConfig: testTransferConfig,
  };

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
});
