/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Storage } from "@google-cloud/storage";

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
  assertGoogleTransferConfig,
  GoogleServerStorage,
  StorageWrapper,
} from "../../../server";
import { StorageControlClientWrapper } from "../../../server/wrappers/StorageControlClientWrapper";
import { ServerStorageConfigProvider } from "../ServerStorageConfigProvider";

describe(`${GoogleServerStorage.name} internal tests`, () => {
  const serverStorageConfig = new ServerStorageConfigProvider().get();

  const serverStorage = createGoogleServerStorage();
  const testDirectoryManager = new TestRemoteDirectoryManager(serverStorage);

  const deleteFunction = async (
    reference: ObjectReference,
    transferConfig: TransferConfig
  ) => {
    assertGoogleTransferConfig(transferConfig);
    const client = new Storage({
      token: transferConfig.authentication,
    });
    await client
      .bucket(serverStorageConfig.bucketName)
      .file(buildObjectKey(reference))
      .delete();
  };

  const listFunction = async (
    baseDirectory: string,
    transferConfig: TransferConfig
  ) => {
    assertGoogleTransferConfig(transferConfig);

    const client = new Storage({
      token: transferConfig.authentication,
    });
    const [files] = await client
      .bucket(serverStorageConfig.bucketName)
      .getFiles({
        prefix: baseDirectory,
        maxResults: 100,
      });

    const references =
      files.map((file) => buildObjectReference(file.name)) ?? [];

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

  function createGoogleServerStorage() {
    const storage = new StorageWrapper(
      new Storage({ projectId: serverStorageConfig.projectId }),
      serverStorageConfig
    );

    const storageControl = new StorageControlClientWrapper(serverStorageConfig);

    return new GoogleServerStorage(
      storage,
      storageControl,
      serverStorageConfig
    );
  }
});
