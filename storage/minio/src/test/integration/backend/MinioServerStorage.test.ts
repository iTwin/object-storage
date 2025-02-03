/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
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
  createStsClient,
} from "@itwin/object-storage-s3/lib/common/internal";

import { ObjectReference, TransferConfig } from "@itwin/object-storage-core";
import {
  S3ClientWrapper,
  S3TransferConfig,
  S3TransferConfigProvider,
  StsWrapper,
} from "@itwin/object-storage-s3";
import {
  TestRemoteDirectory,
  TestRemoteDirectoryManager,
  testDeleteObjectWithTransferConfig,
  testListObjectsWithTransferConfig,
} from "@itwin/object-storage-tests-backend";

import { MinioPresignedUrlProvider, MinioServerStorage } from "../../../server";
import { createClient } from "../../../server/internal";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

describe(`${MinioServerStorage.name} internal tests`, () => {
  const serverStorageConfig = new ServerStorageConfigProvider().get();

  const serverStorage = createMinioServerStorage();
  const testDirectoryManager = new TestRemoteDirectoryManager(serverStorage);

  const deleteFunction = async (
    reference: ObjectReference,
    transferConfig: TransferConfig
  ) => {
    assertS3TransferConfig(transferConfig);
    const client = createMinioS3Client(transferConfig);
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
    const client = createMinioS3Client(transferConfig);

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

  function createMinioServerStorage() {
    const { baseUrl, region, accessKey, secretKey, bucket, stsBaseUrl } =
      serverStorageConfig;

    const endpointUrl = new URL(baseUrl);
    const endpoint = {
      url: endpointUrl,
    };

    const s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });

    const clientWrapper = new S3ClientWrapper(s3Client, bucket);

    const minioClient = createClient({
      accessKey,
      baseUrl,
      secretKey,
    });
    const presignedUrlProvider = new MinioPresignedUrlProvider(
      minioClient,
      bucket
    );

    const stsClient = createStsClient({
      stsBaseUrl,
      region,
      accessKey,
      secretKey,
    });
    const transferConfigProvider = new S3TransferConfigProvider(
      new StsWrapper(stsClient),
      serverStorageConfig
    );

    return new MinioServerStorage(
      clientWrapper,
      presignedUrlProvider,
      transferConfigProvider
    );
  }

  function createMinioS3Client(transferConfig: S3TransferConfig): S3Client {
    const { baseUrl, region } = serverStorageConfig;
    const { accessKey, secretKey, sessionToken } =
      transferConfig.authentication;

    const endpointUrl = new URL(baseUrl);
    const endpoint = {
      url: endpointUrl,
    };

    return new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        sessionToken,
      },
      forcePathStyle: true,
    });
  }
});
