/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { createStubInstance } from "sinon";

import { DIContainer, TypedDependencyConfig } from "@itwin/cloud-agnostic-core";
import { Types as CoreTypes } from "@itwin/object-storage-core";
import {
  mockPresignedUrlProvider,
  mockTransferConfigProvider,
} from "@itwin/object-storage-tests-backend-unit";

import { Constants } from "../../../common";
import { S3ClientWrapper, S3ClientWrapperFactory } from "../../../server";

const dependencyName = Constants.storageType;
export const s3TestConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ServerStorage: {
    bindingStrategy: "Dependency",
    instance: {
      dependencyName,
      bucket: "testBucket",
      accessKey: "testAccessKey",
      secretKey: "testSecretKey",
      baseUrl: "http://testBaseUrl.com",
      region: "testRegion",
      roleArn: "testRoleArn",
      stsBaseUrl: "http://testStsBaseUrl.com",
    },
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ClientStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
    },
  } as TypedDependencyConfig,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName,
    },
  } as TypedDependencyConfig,
};

export function rebindS3Server(container: DIContainer): void {
  const mockS3ClientWrapper = createStubInstance(S3ClientWrapper);

  container.unregister(S3ClientWrapper);
  container.registerInstance(S3ClientWrapper, mockS3ClientWrapper);
  container.unregister(CoreTypes.Server.presignedUrlProvider);
  container.registerInstance(
    CoreTypes.Server.presignedUrlProvider,
    mockPresignedUrlProvider
  );
  container.unregister(CoreTypes.Server.transferConfigProvider);
  container.registerInstance(
    CoreTypes.Server.transferConfigProvider,
    mockTransferConfigProvider
  );
}

export function rebindS3Client(container: DIContainer): void {
  const mockS3ClientWrapperFactory = createStubInstance(S3ClientWrapperFactory);

  container.unregister(CoreTypes.Client.clientWrapperFactory);
  container.registerInstance(
    CoreTypes.Client.clientWrapperFactory,
    mockS3ClientWrapperFactory
  );
}
