/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { AzureClientStorage } from "../../client";
import { AzureTransferConfig, BlockBlobClientWrapperFactory } from "../../frontend";
import { testClientMultipartUploadRelativeDirValidation, testClientUploadRelativeDirValidation, testClientDownloadRelativeDirValidation } from "@itwin/object-storage-tests-unit";

describe.only(`${AzureClientStorage.name}`, () => {
  const clientStorage = new AzureClientStorage(new BlockBlobClientWrapperFactory());

  const testTransferConfig: AzureTransferConfig = {
    expiration: new Date(),
    baseUrl: "testBaseUrl",
    authentication: "testAuthentication",
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
