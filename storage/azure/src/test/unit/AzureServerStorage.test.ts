/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { testServerDownloadRelativeDirValidation, testServerUploadRelativeDirValidation, testServerMultipartUploadRelativeDirValidation, testDeleteObjectRelativeDirValidation, testGetDownloadConfigRelativeDirValidation, testGetDownloadUrlRelativeDirValidation, testGetObjectPropertiesRelativeDirValidation, testGetUploadConfigRelativeDirValidation, testGetUploadUrlRelativeDirValidation, testObjectExistsRelativeDirValidation, testUpdateMetadataRelativeDirValidation } from "@itwin/object-storage-tests-unit";
import { AzureServerStorage, BlobServiceClientWrapper } from "../../server";
import { BlobServiceClient } from "@azure/storage-blob";

describe.only(`${AzureServerStorage.name}`, () => {
  const serverStorage = new AzureServerStorage(
    {
      accountName: "testAccountName",
      accountKey: "testAccountKey",
      baseUrl: "http://testBaseUrl.com"
    },
    new BlobServiceClientWrapper(
      new BlobServiceClient("http://testBaseUrl.com")
    )
  );

  describe(`${serverStorage.download.name}()`, () => {
    testServerDownloadRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.upload.name}()`, () => {
    testServerUploadRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.uploadInMultipleParts.name}()`, () => {
    testServerMultipartUploadRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.deleteObject.name}()`, () => {
    testDeleteObjectRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.objectExists.name}()`, () => {
    testObjectExistsRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.updateMetadata.name}()`, () => {
    testUpdateMetadataRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.getObjectProperties.name}()`, () => {
    testGetObjectPropertiesRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.getDownloadUrl.name}()`, () => {
    testGetDownloadUrlRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.getUploadUrl.name}()`, () => {
    testGetUploadUrlRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.getDownloadConfig.name}()`, () => {
    testGetDownloadConfigRelativeDirValidation(serverStorage);
  });

  describe(`${serverStorage.getUploadConfig.name}()`, () => {
    testGetUploadConfigRelativeDirValidation(serverStorage);
  });
});
