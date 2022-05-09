/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { MinioClientStorage } from "../../client";
import { } from "../../frontend";
import { testClientUploadRelativeDirValidation } from "@itwin/object-storage-tests-unit";
import { S3ClientWrapperFactory, S3TransferConfig } from "@itwin/object-storage-s3";
import { instance, mock } from "ts-mockito";

describe(`${MinioClientStorage.name}`, () => {
  const mockTransferConfigProvider = mock<S3ClientWrapperFactory>();
  const clientStorage = new MinioClientStorage(instance(mockTransferConfigProvider));

  const testTransferConfig: S3TransferConfig = {
    expiration: new Date(),
    baseUrl: "testBaseUrl",
    authentication: {
      accessKey: "testAccessKey",
      secretKey: "testSecretKey",
      sessionToken: "testSessionToken"
    },
    region: "testRegion",
    bucket: "testBucket"
  }

  describe(`${clientStorage.upload.name}()`, () => {
    testClientUploadRelativeDirValidation(clientStorage, testTransferConfig);
  });
});
