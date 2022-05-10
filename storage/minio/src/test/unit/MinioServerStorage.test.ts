/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createStubInstance } from "sinon";

import { S3ClientWrapper } from "@itwin/object-storage-s3";
import {
  Constants,
  mockPresignedUrlProvider,
  mockTransferConfigProvider,
  testRelativeDirectoryValidation,
} from "@itwin/object-storage-tests-unit";

import { MinioServerStorage } from "../../server";

describe(`${MinioServerStorage.name}`, () => {
  const mockS3ClientWrapper = createStubInstance(S3ClientWrapper);
  const serverStorage = new MinioServerStorage(
    mockS3ClientWrapper,
    mockPresignedUrlProvider,
    mockTransferConfigProvider
  );

  describe(`${serverStorage.deleteObject.name}()`, () => {
    it("should throw if relativeDirectory is invalid", async () => {
      await testRelativeDirectoryValidation(async () =>
        serverStorage.deleteObject(Constants.invalidObjectReference)
      );
    });
  });
});
