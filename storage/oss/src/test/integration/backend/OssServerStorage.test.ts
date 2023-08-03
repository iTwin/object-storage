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
import {
  assertS3TransferConfig,
  createS3Client,
} from "@itwin/object-storage-s3/lib/common/internal";

import {
  ObjectReference,
  ServerStorage,
  TransferConfig,
} from "@itwin/object-storage-core";
import {
  S3ClientWrapper,
  S3PresignedUrlProvider,
  S3ServerStorage,
  S3TransferConfig,
} from "@itwin/object-storage-s3";
import {
  TestRemoteDirectory,
  TestRemoteDirectoryManager,
  testDeleteObjectWithTransferConfig,
  testListObjectsWithTransferConfig,
} from "@itwin/object-storage-tests-backend";

import { OssTransferConfigProvider } from "../../../server";
import { createCore } from "../../../server/internal";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

describe(`Oss${ServerStorage.name} internal tests`, () => {
  const serverStorageConfig = new ServerStorageConfigProvider().get();

  const serverStorage = createOssServerStorage();
  const testDirectoryManager = new TestRemoteDirectoryManager(serverStorage);

  const deleteFunction = async (
    reference: ObjectReference,
    transferConfig: TransferConfig
  ) => {
    assertS3TransferConfig(transferConfig);
    const client = createOssS3Client(transferConfig);
    await client.send(
      new DeleteObjectCommand({
        Bucket: serverStorageConfig.bucket,
        Key: buildObjectKey(reference),
      })
    );
  };

  const listFunction = async (
    baseDirectory: string,
    transferConfig: TransferConfig
  ) => {
    assertS3TransferConfig(transferConfig);
    const client = createOssS3Client(transferConfig);

    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: serverStorageConfig.bucket,
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

  function createOssServerStorage() {
    const { baseUrl, region, accessKey, secretKey, bucket, stsBaseUrl } =
      serverStorageConfig;

    const s3Config = { baseUrl, region, accessKey, secretKey };
    const client = createS3Client(s3Config);
    const clientWrapper = new S3ClientWrapper(client, bucket);

    const presignedUrlProvider = new S3PresignedUrlProvider(client, bucket);
    const rpcClient = createCore({
      accessKey,
      secretKey,
      stsBaseUrl,
    });
    const transferConfigProvider = new OssTransferConfigProvider(
      rpcClient,
      serverStorageConfig
    );

    return new S3ServerStorage(
      clientWrapper,
      presignedUrlProvider,
      transferConfigProvider
    );
  }

  function createOssS3Client(transferConfig: S3TransferConfig): S3Client {
    const { baseUrl, region } = serverStorageConfig;
    const { accessKey, secretKey, sessionToken } =
      transferConfig.authentication;

    const s3Config = { baseUrl, region, accessKey, secretKey, sessionToken };
    return createS3Client(s3Config);
  }
});
