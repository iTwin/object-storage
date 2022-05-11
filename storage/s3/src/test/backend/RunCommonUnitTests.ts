/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { createStubInstance } from "sinon";

import {
  mockPresignedUrlProvider,
  mockTransferConfigProvider,
  StorageUnitTests,
} from "@itwin/object-storage-tests-backend-unit";

import { S3ClientStorage } from "../../client";
import { S3ClientWrapper, S3ClientWrapperFactory } from "../../frontend";
import { S3ServerStorage } from "../../server";

const mockS3ClientWrapper: S3ClientWrapper =
  createStubInstance(S3ClientWrapper);
const serverStorage = new S3ServerStorage(
  mockS3ClientWrapper,
  mockPresignedUrlProvider,
  mockTransferConfigProvider
);

const mockS3ClientWrapperFactory = createStubInstance(S3ClientWrapperFactory);
const clientStorage = new S3ClientStorage(mockS3ClientWrapperFactory);

const tests = new StorageUnitTests(serverStorage, clientStorage);
tests.start().catch((err) => {
  process.exitCode = 1;
  throw err;
});
