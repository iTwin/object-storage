/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";

import { DIContainer } from "@itwin/cloud-agnostic-core";
import {
  Types as CoreTypes,
  PresignedUrlProvider,
  ServerStorage,
  TransferConfigProvider,
} from "@itwin/object-storage-core";
import {
  Constants,
  DependencyBindingsTestCase,
  InvalidConfigTestCase,
  testBindings,
  testInvalidServerConfig,
} from "@itwin/object-storage-tests-backend-unit";

import { Constants as S3Constants, Types } from "../../../common";
import {
  S3ClientWrapper,
  S3PresignedUrlProvider,
  S3ServerStorage,
  S3ServerStorageBindings,
  S3ServerStorageBindingsConfig,
  S3ServerStorageConfig,
  S3TransferConfigProvider,
  StsWrapper,
} from "../../../server";

describe(`${S3ServerStorageBindings.name}`, () => {
  const serverBindings = new S3ServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
    const invalidConfigTestCases: InvalidConfigTestCase[] = [
      {
        config: {
          dependencyName: Constants,
        } as unknown as S3ServerStorageBindingsConfig,
        expectedErrorMessage: "accessKey is not defined in configuration",
      },
      {
        config: {
          dependencyName: S3Constants.storageType,
          accessKey: "testAccessKey",
        } as unknown as S3ServerStorageBindingsConfig,
        expectedErrorMessage: "bucket is not defined in configuration",
      },
      {
        config: {
          dependencyName: S3Constants.storageType,
          accessKey: "testAccessKey",
          bucket: "testBucket",
        } as unknown as S3ServerStorageBindingsConfig,
        expectedErrorMessage: "baseUrl is not defined in configuration",
      },
      {
        config: {
          dependencyName: S3Constants.storageType,
          accessKey: "testAccessKey",
          bucket: "testBucket",
          baseUrl: "testBaseUrl",
        } as unknown as S3ServerStorageBindingsConfig,
        expectedErrorMessage: "region is not defined in configuration",
      },
      {
        config: {
          dependencyName: S3Constants.storageType,
          accessKey: "testAccessKey",
          bucket: "testBucket",
          baseUrl: "testBaseUrl",
          region: "testRegion",
        } as unknown as S3ServerStorageBindingsConfig,
        expectedErrorMessage: "roleArn is not defined in configuration",
      },
      {
        config: {
          dependencyName: S3Constants.storageType,
          accessKey: "testAccessKey",
          bucket: "testBucket",
          baseUrl: "testBaseUrl",
          region: "testRegion",
          roleArn: "testRoleArn",
        } as unknown as S3ServerStorageBindingsConfig,
        expectedErrorMessage: "secretKey is not defined in configuration",
      },
      {
        config: {
          dependencyName: S3Constants.storageType,
          accessKey: "testAccessKey",
          bucket: "testBucket",
          baseUrl: "testBaseUrl",
          region: "testRegion",
          roleArn: "testRoleArn",
          secretKey: "testSecretKey",
        } as unknown as S3ServerStorageBindingsConfig,
        expectedErrorMessage: "stsBaseUrl is not defined in configuration",
      },
    ];
    testInvalidServerConfig(serverBindings, invalidConfigTestCases);

    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: Types.S3Server.config.toString(),
        testedFunction: (c: DIContainer) =>
          c.resolve<S3ServerStorageConfig>(Types.S3Server.config),
        expectedCtor: Object,
      },
      {
        testedClassIdentifier: ServerStorage.name,
        testedFunction: (c: DIContainer) => c.resolve(ServerStorage),
        expectedCtor: S3ServerStorage,
      },
      {
        testedClassIdentifier: S3Client.name,
        testedFunction: (c: DIContainer) => c.resolve(S3Client),
        expectedCtor: S3Client,
      },
      {
        testedClassIdentifier: StsWrapper.name,
        testedFunction: (c: DIContainer) => c.resolve(StsWrapper),
        expectedCtor: StsWrapper,
      },
      {
        testedClassIdentifier: STSClient.name,
        testedFunction: (c: DIContainer) => c.resolve(STSClient),
        expectedCtor: STSClient,
      },
      {
        testedClassIdentifier: Types.bucket.toString(),
        testedFunction: (c: DIContainer) => c.resolve<string>(Types.bucket),
        expectedCtor: String,
      },
      {
        testedClassIdentifier: S3ClientWrapper.name,
        testedFunction: (c: DIContainer) => c.resolve(S3ClientWrapper),
        expectedCtor: S3ClientWrapper,
      },
      {
        testedClassIdentifier: CoreTypes.Server.presignedUrlProvider.toString(),
        testedFunction: (c: DIContainer) =>
          c.resolve<PresignedUrlProvider>(
            CoreTypes.Server.presignedUrlProvider
          ),
        expectedCtor: S3PresignedUrlProvider,
      },
      {
        testedClassIdentifier:
          CoreTypes.Server.transferConfigProvider.toString(),
        testedFunction: (c: DIContainer) =>
          c.resolve<TransferConfigProvider>(
            CoreTypes.Server.transferConfigProvider
          ),
        expectedCtor: S3TransferConfigProvider,
      },
    ];
    testBindings(
      serverBindings,
      Constants.validS3ServerStorageConfig,
      bindingsTestCases
    );
  });
});
