/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  buildObjectKey,
  buildObjectReference,
} from "@itwin/object-storage-core/lib/common/internal";
import { assertS3TransferConfig } from "@itwin/object-storage-s3/lib/common/internal";

import { ObjectReference, TransferConfig } from "@itwin/object-storage-core";
import { S3TransferConfig } from "@itwin/object-storage-s3";
import {
  InternalStorageIntegrationTests,
  TestRemoteDirectory,
  TestRemoteDirectoryManager,
  testDeleteObjectWithTransferConfig,
  testListObjectsWithTransferConfig,
} from "@itwin/object-storage-tests-backend";

import { OssServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

describe("OssServerStorage internal tests", () => {
  const serverStorageConfig = new ServerStorageConfigProvider().get();
  const config = {
    ServerStorage: {
      dependencyName: "oss",
      instanceName: "primary",
      ...serverStorageConfig,
    },
  };

  const testInfrastructure = new InternalStorageIntegrationTests(
    config,
    OssServerStorageBindings
  );
  const testDirectoryManager = new TestRemoteDirectoryManager(
    testInfrastructure.serverStorage
  );

  beforeEach(async () => {
    await testDirectoryManager.purgeCreatedDirectories();
  });

  after(async () => {
    await testDirectoryManager.purgeCreatedDirectories();
  });

  it(`should delete object using transfer config`, async () => {
    const deleteFunction = async (
      reference: ObjectReference,
      transferConfig: TransferConfig
    ) => {
      assertS3TransferConfig(transferConfig);
      const client = createOssS3Client(transferConfig);
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.ServerStorage.bucket,
          Key: buildObjectKey(reference),
        })
      );
    };

    const testDirectory: TestRemoteDirectory =
      await testDirectoryManager.createNew();

    await testDeleteObjectWithTransferConfig(testDirectory, deleteFunction);
  });

  it(`should list objects using transfer config`, async () => {
    const listFunction = async (
      baseDirectory: string,
      transferConfig: TransferConfig
    ) => {
      assertS3TransferConfig(transferConfig);
      const client = createOssS3Client(transferConfig);

      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: config.ServerStorage.bucket,
          Prefix: baseDirectory,
          MaxKeys: 100,
        })
      );

      const references =
        response.Contents?.map((object) => buildObjectReference(object.Key!)) ??
        [];

      const nonEmptyReferences = references.filter((ref) => !!ref.objectName);
      return nonEmptyReferences;
    };
    const testDirectory: TestRemoteDirectory =
      await testDirectoryManager.createNew();

    await testListObjectsWithTransferConfig(testDirectory, listFunction);
  });

  function createOssS3Client(transferConfig: S3TransferConfig): S3Client {
    const { baseUrl, region } = config.ServerStorage;
    const { accessKey, secretKey, sessionToken } =
      transferConfig.authentication;

    return new S3Client({
      endpoint: baseUrl,
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        sessionToken,
      },
    });
  }
});
