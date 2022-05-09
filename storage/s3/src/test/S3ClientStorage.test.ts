/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3ClientStorage } from "../client";
import { S3ClientWrapperFactory, S3TransferConfig } from "../frontend";
import { testClientMultipartUploadRelativeDirValidation, testClientUploadRelativeDirValidation, testClientDownloadRelativeDirValidation } from "@itwin/object-storage-tests-unit";
import { instance, mock } from "ts-mockito";

describe.only(`${S3ClientStorage.name}`, () => {
  const mockTransferConfigProvider = mock<S3ClientWrapperFactory>();
  const clientStorage = new S3ClientStorage(instance(mockTransferConfigProvider));

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

  describe(`${clientStorage.download.name}()`, () => {
    testClientDownloadRelativeDirValidation(clientStorage, testTransferConfig);
  });

  describe(`${clientStorage.upload.name}()`, () => {
    testClientUploadRelativeDirValidation(clientStorage, testTransferConfig);
  });

  describe(`${clientStorage.uploadInMultipleParts.name}()`, () => {
    testClientMultipartUploadRelativeDirValidation(clientStorage, testTransferConfig);
  });
});
