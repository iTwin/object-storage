/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { testDeleteObjectRelativeDirValidation } from "@itwin/object-storage-tests-unit";
import { MinioServerStorage } from "../../server";
import {
  instance,
  mock,
} from "ts-mockito";
import { PresignedUrlProvider, TransferConfigProvider } from "@itwin/object-storage-core";
import { S3ClientWrapper } from "@itwin/object-storage-s3";

describe(`${MinioServerStorage.name}`, () => {
  const mockS3ClientWrapper = mock<S3ClientWrapper>();
  const mockPresignedUrlProvider = mock<PresignedUrlProvider>();
  const mockTransferConfigProvider = mock<TransferConfigProvider>();
  const serverStorage = new MinioServerStorage(
    instance(mockS3ClientWrapper),
    instance(mockPresignedUrlProvider),
    instance(mockTransferConfigProvider),
  );

  describe(`${serverStorage.deleteObject.name}()`, () => {
    testDeleteObjectRelativeDirValidation(serverStorage);
  });
});
