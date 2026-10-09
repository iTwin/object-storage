/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Storage } from "@google-cloud/storage";
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { createStubInstance } from "sinon";

import { GoogleServerStorage, StorageWrapper } from "../../../server";
import { StorageControlClientWrapper } from "../../../server/wrappers/StorageControlClientWrapper";

use(chaiAsPromised);

const bucketName = "test-bucket-name";

function createFakeStorage(objectNames: string[]): {
  storage: Storage;
  remaining: Set<string>;
} {
  const remaining = new Set(objectNames);
  const bucket = {
    getFiles: (options: { prefix?: string }) =>
      Promise.resolve([
        [...remaining]
          .filter((name) => name.startsWith(options.prefix ?? ""))
          .map((name) => ({ name })),
        null,
      ]),
    file: (name: string) => ({
      delete: () => {
        remaining.delete(name);
        return Promise.resolve();
      },
    }),
  };
  const storage = { bucket: () => bucket } as unknown as Storage;
  return { storage, remaining };
}

describe("Google directory isolation", () => {
  const objectNames = [
    "tenant-a/contract.pdf",
    "tenant-a/nested/file.bim",
    "tenant-ab/contract.pdf",
    "tenant-a2/payroll.xlsx",
    "tenant-a-backup/file.bim",
  ];
  const siblingObjectNames = objectNames.filter(
    (name) => !name.startsWith("tenant-a/")
  );

  it("should not list objects of directories sharing a name prefix", async () => {
    const { storage } = createFakeStorage(objectNames);
    const wrapper = new StorageWrapper(storage, { bucketName });

    const page = await wrapper.getFilesNextPage({
      directory: { baseDirectory: "tenant-a" },
      maxPageSize: 100,
    });

    expect(page.entities.map((entity) => entity.baseDirectory)).to.deep.equal([
      "tenant-a",
      "tenant-a",
    ]);
  });

  it("should not delete objects of directories sharing a name prefix", async () => {
    const { storage, remaining } = createFakeStorage(objectNames);
    const serverStorage = new GoogleServerStorage(
      new StorageWrapper(storage, { bucketName }),
      createStubInstance(StorageControlClientWrapper),
      { projectId: "testProjectId", bucketName }
    );

    await serverStorage.deleteBaseDirectory({ baseDirectory: "tenant-a" });

    expect([...remaining]).to.have.members(siblingObjectNames);
  });

  it("should not delete the whole bucket for an empty base directory", async () => {
    const { storage, remaining } = createFakeStorage(objectNames);
    const serverStorage = new GoogleServerStorage(
      new StorageWrapper(storage, { bucketName }),
      createStubInstance(StorageControlClientWrapper),
      { projectId: "testProjectId", bucketName }
    );

    await expect(
      serverStorage.deleteBaseDirectory({ baseDirectory: "" })
    ).to.eventually.be.rejectedWith(Error, "Base directory cannot be empty.");
    expect([...remaining]).to.have.members(objectNames);
  });

  it("should reject copying from a non-Google storage", async () => {
    const { storage } = createFakeStorage([]);
    const serverStorage = new GoogleServerStorage(
      new StorageWrapper(storage, { bucketName }),
      createStubInstance(StorageControlClientWrapper),
      { projectId: "testProjectId", bucketName }
    );
    const reference = { baseDirectory: "tenant-a", objectName: "file" };

    await expect(
      serverStorage.copyObject(
        {} as unknown as GoogleServerStorage,
        reference,
        reference
      )
    ).to.eventually.be.rejectedWith(
      Error,
      "Source storage must be an instance of GoogleServerStorage"
    );
  });
});
