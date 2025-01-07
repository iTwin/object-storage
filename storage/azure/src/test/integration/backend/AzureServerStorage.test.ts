/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobClient,
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

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
  assertAzureTransferConfig,
  buildBlobUrl,
} from "../../../common/internal";
import { AzureServerStorage, BlobServiceClientWrapper } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

describe(`${AzureServerStorage.name} internal tests`, () => {
  const serverStorage = createAzureServerStorage();
  const testDirectoryManager = new TestRemoteDirectoryManager(serverStorage);

  const deleteFunction = async (
    reference: ObjectReference,
    transferConfig: TransferConfig
  ) => {
    assertAzureTransferConfig(transferConfig);
    const blobUrl = buildBlobUrl({
      transferConfig,
      reference,
    });
    const blobClient = new BlobClient(blobUrl);
    await blobClient.delete();
  };

  const listFunction = async (
    baseDirectory: string,
    transferConfig: TransferConfig
  ) => {
    assertAzureTransferConfig(transferConfig);
    const containerUrl = buildContainerUrl(baseDirectory, transferConfig);
    const containerClient = new ContainerClient(containerUrl);

    const iter = containerClient.listBlobsFlat();
    const names = Array<string>();
    for await (const item of iter) names.push(item.name);

    return names.map((name) =>
      buildObjectReference(
        buildObjectKey({
          baseDirectory: baseDirectory,
          objectName: name,
        })
      )
    );
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

  function createAzureServerStorage() {
    const serverStorageConfig = new ServerStorageConfigProvider().get();
    const credentials = new StorageSharedKeyCredential(
      serverStorageConfig.accountName,
      serverStorageConfig.accountKey
    );
    const blobServiceClient = new BlobServiceClient(
      serverStorageConfig.baseUrl,
      credentials
    );

    return new AzureServerStorage(
      serverStorageConfig,
      new BlobServiceClientWrapper(blobServiceClient)
    );
  }

  function buildContainerUrl(
    baseDirectory: string,
    transferConfig: TransferConfig
  ): string {
    assertAzureTransferConfig(transferConfig);
    const { authentication, baseUrl } = transferConfig;
    return `${baseUrl}/${baseDirectory}?${authentication}`;
  }
});
