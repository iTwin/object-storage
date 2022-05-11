/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { StorageUnitTests,mockPresignedUrlProvider, mockTransferConfigProvider  } from "@itwin/object-storage-tests-backend-unit";
import { createStubInstance } from "sinon";
import { MinioClientStorage } from "../../../client";
import { S3ClientWrapper, S3ClientWrapperFactory } from "@itwin/object-storage-s3";
import { MinioServerStorage } from "../../../server";

const mockS3ClientWrapper = createStubInstance(S3ClientWrapper);
const serverStorage = new MinioServerStorage(
  mockS3ClientWrapper,
  mockPresignedUrlProvider,
  mockTransferConfigProvider
);

const mockS3ClientWrapperFactory = createStubInstance(S3ClientWrapperFactory);
const clientStorage = new MinioClientStorage(mockS3ClientWrapperFactory);

const tests = new StorageUnitTests(
  serverStorage,
  clientStorage,
);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
