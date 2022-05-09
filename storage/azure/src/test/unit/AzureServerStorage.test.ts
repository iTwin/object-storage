/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { testServerDownloadRelativeDirValidation, testServerUploadRelativeDirValidation, testServerMultipartUploadRelativeDirValidation, testDeleteObjectRelativeDirValidation, testGetDownloadConfigRelativeDirValidation, testGetDownloadUrlRelativeDirValidation, testGetObjectPropertiesRelativeDirValidation, testGetUploadConfigRelativeDirValidation, testGetUploadUrlRelativeDirValidation, testObjectExistsRelativeDirValidation, testUpdateMetadataRelativeDirValidation } from "@itwin/object-storage-tests-unit";
import { AzureServerStorage, AzureServerStorageConfig, BlobServiceClientWrapper } from "../../server";
import { mock, instance } from "ts-mockito";

describe(`${AzureServerStorage.name}`, () => {
  const mockAzureServerStorageConfig: AzureServerStorageConfig =   {
    accountName: "testAccountName",
    accountKey: "testAccountKey",
    baseUrl: "testBaseUrl"
  };
  const mockBlobServiceClientWrapper = mock<BlobServiceClientWrapper>();
  const serverStorage = new AzureServerStorage(
    mockAzureServerStorageConfig,
    instance(mockBlobServiceClientWrapper)
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
