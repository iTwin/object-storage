/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { testServerDownloadRelativeDirValidation, testServerUploadRelativeDirValidation, testServerMultipartUploadRelativeDirValidation, testDeleteObjectRelativeDirValidation, testGetDownloadConfigRelativeDirValidation, testGetDownloadUrlRelativeDirValidation, testGetObjectPropertiesRelativeDirValidation, testGetUploadConfigRelativeDirValidation, testGetUploadUrlRelativeDirValidation, testObjectExistsRelativeDirValidation, testUpdateMetadataRelativeDirValidation } from "@itwin/object-storage-tests-unit";
import { S3ClientWrapper } from "../frontend";
import { S3ServerStorage } from "../server";
import {
  instance,
  mock,
} from "ts-mockito";
import { PresignedUrlProvider, TransferConfigProvider } from "@itwin/object-storage-core";

describe(`${S3ServerStorage.name}`, () => {
  const mockS3ClientWrapper = mock<S3ClientWrapper>();
  const mockPresignedUrlProvider = mock<PresignedUrlProvider>();
  const mockTransferConfigProvider = mock<TransferConfigProvider>();
  const serverStorage = new S3ServerStorage(
    instance(mockS3ClientWrapper),
    instance(mockPresignedUrlProvider),
    instance(mockTransferConfigProvider),
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
