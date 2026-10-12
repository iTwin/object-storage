/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

import {
  buildObjectKey,
  buildObjectReference,
} from "@itwin/object-storage-core/lib/common/internal";

import { ObjectReference, TransferConfig } from "@itwin/object-storage-core";
import {
  TestRemoteDirectory,
  TestRemoteDirectoryManager,
  testDeleteObjectWithTransferConfig,
  testListObjectsWithTransferConfig,
} from "@itwin/object-storage-tests-backend";

import {
  assertS3TransferConfig,
  createS3Client,
  createStsClient,
} from "../../../common/internal";
import {
  S3ClientWrapper,
  S3PresignedUrlProvider,
  S3ServerStorage,
  S3TransferConfigProvider,
  StsWrapper,
} from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

describe(`${S3ServerStorage.name} internal tests`, () => {
  const serverStorageConfig = new ServerStorageConfigProvider().get();

  const serverStorage = createS3ServerStorage();
  const testDirectoryManager = new TestRemoteDirectoryManager(serverStorage);

  const deleteFunction = async (
    reference: ObjectReference,
    transferConfig: TransferConfig
  ) => {
    assertS3TransferConfig(transferConfig);
    const client = createS3Client({
      ...transferConfig,
      ...transferConfig.authentication,
    });
    await client.send(
      new DeleteObjectCommand({
        Bucket: transferConfig.bucket,
        Key: buildObjectKey(reference),
      })
    );
  };

  const listFunction = async (
    baseDirectory: string,
    transferConfig: TransferConfig
  ) => {
    assertS3TransferConfig(transferConfig);
    const client = createS3Client({
      ...transferConfig,
      ...transferConfig.authentication,
    });

    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: transferConfig.bucket,
        Prefix: baseDirectory,
        MaxKeys: 100,
      })
    );

    const references =
      response.Contents?.map((object) => buildObjectReference(object.Key!)) ??
      [];

    return references.filter((reference) => !!reference.objectName);
  };

  beforeEach(async () => {
    await testDirectoryManager.purgeCreatedDirectories();
  });

  after(async () => {
    await testDirectoryManager.purgeCreatedDirectories();
  });

  it(`should delete object using transfer config`, async () => {
    const testDirectory: TestRemoteDirectory =
      await testDirectoryManager.createNew();

    await testDeleteObjectWithTransferConfig(
      serverStorage,
      testDirectory,
      deleteFunction
    );
  });

  it(`should list objects using transfer config`, async () => {
    const testDirectory: TestRemoteDirectory =
      await testDirectoryManager.createNew();

    await testListObjectsWithTransferConfig(
      serverStorage,
      testDirectory,
      listFunction
    );
  });

  function createS3ServerStorage(): S3ServerStorage {
    const s3Client = createS3Client(serverStorageConfig);
    return new S3ServerStorage(
      new S3ClientWrapper(s3Client, serverStorageConfig.bucket),
      new S3PresignedUrlProvider(s3Client, serverStorageConfig),
      new S3TransferConfigProvider(
        new StsWrapper(createStsClient(serverStorageConfig)),
        serverStorageConfig
      )
    );
  }
});
