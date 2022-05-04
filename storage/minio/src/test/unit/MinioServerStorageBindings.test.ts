/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";
import { Client } from "minio";

import {
  PresignedUrlProvider,
  ServerStorage,
  Types,
} from "@itwin/object-storage-core";
import { S3ServerStorageBindingsConfig } from "@itwin/object-storage-s3";
import {
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-unit";

import {
  MinioPresignedUrlProvider,
  MinioServerStorage,
  MinioServerStorageBindings,
} from "../../server";

describe.only(`${MinioServerStorageBindings.name}`, () => {
  const serverBindings = new MinioServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
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
        symbolUnderTestName: ServerStorage.name,
        functionUnderTest: (container: Container) =>
          container.get(ServerStorage),
        expectedCtor: MinioServerStorage,
      },
      {
        symbolUnderTestName: Types.Server.presignedUrlProvider.toString(),
        functionUnderTest: (container: Container) =>
          container.get<PresignedUrlProvider>(
            Types.Server.presignedUrlProvider
          ),
        expectedCtor: MinioPresignedUrlProvider,
      },
      {
        symbolUnderTestName: Client.name,
        functionUnderTest: (container: Container) => container.get(Client),
        expectedCtor: Client,
      },
    ];
    testBindings(serverBindings, config, bindingsTestCases);
  });
});
