/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { expect } from "chai";

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
        Prefix: `${baseDirectory}/`,
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

  describe("directory access config credentials", () => {
    async function expectForbidden(request: Promise<unknown>): Promise<void> {
      const error = await request.then(
        () => undefined,
        (reason: { $metadata?: { httpStatusCode?: number } }) => reason
      );

      expect(error, "request should have been rejected").to.not.be.undefined;
      expect(error!.$metadata?.httpStatusCode).to.equal(403);
    }

    async function createListClient(directory: TestRemoteDirectory) {
      const transferConfig = await serverStorage.getDirectoryAccessConfig(
        directory.baseDirectory
      );
      assertS3TransferConfig(transferConfig);
      return {
        bucket: transferConfig.bucket,
        client: createS3Client({
          ...transferConfig,
          ...transferConfig.authentication,
        }),
      };
    }

    it("should list the own directory", async () => {
      const own = await testDirectoryManager.createNew();
      await own.uploadFile({ objectName: "own.txt" }, undefined, undefined);
      const { client, bucket } = await createListClient(own);

      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: `${own.baseDirectory.baseDirectory}/`,
        })
      );

      expect(response.Contents?.map((object) => object.Key)).to.include(
        `${own.baseDirectory.baseDirectory}/own.txt`
      );
    });

    it("should not list a sibling directory", async () => {
      const own = await testDirectoryManager.createNew();
      const victim = await testDirectoryManager.createNew();
      await victim.uploadFile(
        { objectName: "victim.txt" },
        undefined,
        undefined
      );
      const { client, bucket } = await createListClient(own);

      await expectForbidden(
        client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: `${victim.baseDirectory.baseDirectory}/`,
          })
        )
      );
    });

    it("should not list the bucket root without a prefix", async () => {
      const own = await testDirectoryManager.createNew();
      const victim = await testDirectoryManager.createNew();
      await victim.uploadFile(
        { objectName: "victim.txt" },
        undefined,
        undefined
      );
      const { client, bucket } = await createListClient(own);

      await expectForbidden(
        client.send(new ListObjectsV2Command({ Bucket: bucket }))
      );
    });

    it("should not discover sibling directories with a delimiter", async () => {
      const own = await testDirectoryManager.createNew();
      await testDirectoryManager.createNew();
      const { client, bucket } = await createListClient(own);

      await expectForbidden(
        client.send(
          new ListObjectsV2Command({ Bucket: bucket, Delimiter: "/" })
        )
      );
    });
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
