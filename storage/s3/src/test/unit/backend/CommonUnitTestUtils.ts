/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";
import { createStubInstance } from "sinon";

import {
  Types as CoreTypes,
  PresignedUrlProvider,
  TransferConfigProvider,
} from "@itwin/object-storage-core";
import {
  mockPresignedUrlProvider,
  mockTransferConfigProvider,
} from "@itwin/object-storage-tests-backend-unit";

import { S3ClientWrapper, S3ClientWrapperFactory } from "../../../frontend";

const dependencyName = "s3";
export const s3TestConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    dependencyName,
    bucket: "testBucket",
    accessKey: "testAccessKey",
    secretKey: "testSecretKey",
    baseUrl: "http://testBaseUrl.com",
    region: "testRegion",
    roleArn: "testRoleArn",
    stsBaseUrl: "http://testStsBaseUrl.com",
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    dependencyName,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    dependencyName,
  },
};

export function rebindS3Server(container: Container): void {
  const mockS3ClientWrapper = createStubInstance(S3ClientWrapper);

  container.rebind(S3ClientWrapper).toConstantValue(mockS3ClientWrapper);
  container
    .rebind<PresignedUrlProvider>(CoreTypes.Server.presignedUrlProvider)
    .toConstantValue(mockPresignedUrlProvider);
  container
    .rebind<TransferConfigProvider>(CoreTypes.Server.transferConfigProvider)
    .toConstantValue(mockTransferConfigProvider);
}

export function rebindS3Client(container: Container): void {
  const mockS3ClientWrapperFactory = createStubInstance(S3ClientWrapperFactory);

  container
    .rebind(CoreTypes.Client.clientWrapperFactory)
    .toConstantValue(mockS3ClientWrapperFactory);
}
