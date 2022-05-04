/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";
import { Container } from "inversify";

import {
  Types as CoreTypes,
  PresignedUrlProvider,
  ServerStorage,
  TransferConfigProvider,
} from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-unit";

import { Types } from "../common";
import { S3ClientWrapper } from "../frontend";
import {
  S3PresignedUrlProvider,
  S3ServerStorage,
  S3ServerStorageBindings,
  S3ServerStorageBindingsConfig,
  S3ServerStorageConfig,
  S3TransferConfigProvider,
} from "../server";

describe(`${S3ServerStorageBindings.name}`, () => {
  const serverBindings = new S3ServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
    // TODO:

    const config: S3ServerStorageBindingsConfig = {
      dependencyName: "minio",
      baseUrl: "https://testBaseUrl.com",
      region: "testRegion",
      bucket: "testBucket",
      accessKey: "testAccessKey",
      secretKey: "testSecretKey",
      roleArn: "testRoleArn",
      stsBaseUrl: "https://testStsBaseUrl.com",
    };
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        symbolUnderTestName: Types.S3Server.config.toString(),
        functionUnderTest: (container: Container) =>
          container.get<S3ServerStorageConfig>(Types.S3Server.config),
        expectedCtor: Object,
      },
      {
        symbolUnderTestName: ServerStorage.name,
        functionUnderTest: (container: Container) =>
          container.get(ServerStorage),
        expectedCtor: S3ServerStorage,
      },
      {
        symbolUnderTestName: S3Client.name,
        functionUnderTest: (container: Container) => container.get(S3Client),
        expectedCtor: S3Client,
      },
      {
        symbolUnderTestName: STSClient.name,
        functionUnderTest: (container: Container) => container.get(STSClient),
        expectedCtor: STSClient,
      },
      {
        symbolUnderTestName: Types.bucket.toString(),
        functionUnderTest: (container: Container) =>
          container.get<string>(Types.bucket),
        expectedCtor: String,
      },
      {
        symbolUnderTestName: S3ClientWrapper.name,
        functionUnderTest: (container: Container) =>
          container.get(S3ClientWrapper),
        expectedCtor: S3ClientWrapper,
      },
      {
        symbolUnderTestName: CoreTypes.Server.presignedUrlProvider.toString(),
        functionUnderTest: (container: Container) =>
          container.get<PresignedUrlProvider>(
            CoreTypes.Server.presignedUrlProvider
          ),
        expectedCtor: S3PresignedUrlProvider,
      },
      {
        symbolUnderTestName: CoreTypes.Server.transferConfigProvider.toString(),
        functionUnderTest: (container: Container) =>
          container.get<TransferConfigProvider>(
            CoreTypes.Server.transferConfigProvider
          ),
        expectedCtor: S3TransferConfigProvider,
      },
    ];
    testBindings(serverBindings, config, bindingsTestCases);
  });
});
