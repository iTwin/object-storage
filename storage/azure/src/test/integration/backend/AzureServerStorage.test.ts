/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { BlobClient, ContainerClient } from "@azure/storage-blob";

import {
  buildObjectKey,
  buildObjectReference,
} from "@itwin/object-storage-core/lib/common/internal";

import { ObjectReference, TransferConfig } from "@itwin/object-storage-core";
import {
  InternalStorageIntegrationTests,
  TestRemoteDirectory,
  TestRemoteDirectoryManager,
  testDeleteObjectWithTransferConfig,
  testListObjectsWithTransferConfig,
} from "@itwin/object-storage-tests-backend";

import {
  assertAzureTransferConfig,
  buildBlobUrl,
} from "../../../common/internal";
import { AzureServerStorageBindings } from "../../../server";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

describe("AzureServerStorage internal tests", () => {
  const serverStorageConfig = new ServerStorageConfigProvider().get();
  const config = {
    ServerStorage: {
      dependencyName: "azure",
      instanceName: "primary",
      ...serverStorageConfig,
    },
  };

  const testInfrastructure = new InternalStorageIntegrationTests(
    config,
    AzureServerStorageBindings
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
      assertAzureTransferConfig(transferConfig);
      const blobUrl = buildBlobUrl({
        transferConfig,
        reference,
      });
      const blobClient = new BlobClient(blobUrl);
      await blobClient.delete();
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
    const testDirectory: TestRemoteDirectory =
      await testDirectoryManager.createNew();

    await testListObjectsWithTransferConfig(testDirectory, listFunction);
  });

  function buildContainerUrl(
    baseDirectory: string,
    transferConfig: TransferConfig
  ): string {
    assertAzureTransferConfig(transferConfig);
    const { authentication, baseUrl } = transferConfig;
    return `${baseUrl}/${baseDirectory}?${authentication}`;
  }
});
