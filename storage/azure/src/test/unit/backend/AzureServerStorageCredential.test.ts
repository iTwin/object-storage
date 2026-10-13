/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { TokenCredential } from "@azure/core-auth";
import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
  UserDelegationKey,
} from "@azure/storage-blob";
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub, useFakeTimers } from "sinon";
import type { SinonFakeTimers, SinonStub } from "sinon";

import { ObjectDirectory, ObjectReference } from "@itwin/object-storage-core";

import {
  AzureServerStorage,
  AzureServerStorageConfig,
  AzureServerStorageCredentialConfig,
  BlobServiceClientWrapper,
} from "../../../server";

use(chaiAsPromised);

const accountName = "account";
const accountKey = Buffer.from("test-account-key").toString("base64");
const baseUrl = `https://${accountName}.blob.core.windows.net`;
const now = Date.UTC(2026, 0, 1);
const hour = 60 * 60 * 1000;
const day = 24 * hour;
const maxCredentialExpiry = 7 * day - 5 * 60 * 1000;

const credential: TokenCredential = {
  getToken: () => {
    throw new Error("credential must not be used to sign SAS");
  },
};

const reference: ObjectReference = {
  baseDirectory: "container",
  relativeDirectory: "dir",
  objectName: "object.bim",
};
const directory: ObjectDirectory = {
  baseDirectory: "container",
  relativeDirectory: "dir",
};

function delegationKey(): UserDelegationKey {
  return {
    signedObjectId: "00000000-0000-0000-0000-000000000001",
    signedTenantId: "00000000-0000-0000-0000-000000000002",
    signedStartsOn: new Date(now - 5 * 60 * 1000),
    signedExpiresOn: new Date(now - 5 * 60 * 1000 + 7 * day),
    signedService: "b",
    signedVersion: "2025-01-05",
    value: Buffer.from("test-delegation-key").toString("base64"),
  };
}

type Signer = (
  permissions: BlobSASPermissions | ContainerSASPermissions,
  expiresOn: Date,
  blobName?: string
) => string;

const sharedKeySigner: Signer = (permissions, expiresOn, blobName) =>
  generateBlobSASQueryParameters(
    { containerName: "container", blobName, permissions, expiresOn },
    new StorageSharedKeyCredential(accountName, accountKey)
  ).toString();

const delegationSigner: Signer = (permissions, expiresOn, blobName) =>
  generateBlobSASQueryParameters(
    { containerName: "container", blobName, permissions, expiresOn },
    delegationKey(),
    accountName
  ).toString();

async function expectAllSasOutputs(
  storage: AzureServerStorage,
  sign: Signer
): Promise<void> {
  const expiresOn = new Date(now + hour);
  const expiry = { expiresOn };
  const blobUrl = `${baseUrl}/container/dir/object.bim`;
  const read = BlobSASPermissions.parse("r");
  const write = BlobSASPermissions.parse("w");

  expect(await storage.getDownloadUrl(reference, expiry)).to.equal(
    `${blobUrl}?${sign(read, expiresOn, "dir/object.bim")}`
  );
  expect(await storage.getUploadUrl(reference, expiry)).to.equal(
    `${blobUrl}?${sign(write, expiresOn, "dir/object.bim")}`
  );
  expect(
    (await storage.getDownloadConfig(directory, expiry)).authentication
  ).to.equal(sign(read, expiresOn));
  expect(
    (await storage.getUploadConfig(directory, expiry)).authentication
  ).to.equal(sign(write, expiresOn));
  expect(
    (await storage.getDirectoryAccessConfig(directory, expiry)).authentication
  ).to.equal(
    sign(
      ContainerSASPermissions.from({
        read: true,
        write: true,
        delete: true,
        list: true,
      }),
      expiresOn
    )
  );
}

describe(`${AzureServerStorage.name} SAS signing`, () => {
  let clock: SinonFakeTimers;
  let client: BlobServiceClientWrapper;
  let getUserDelegationKey: SinonStub;

  beforeEach(() => {
    clock = useFakeTimers({ now, toFake: ["Date"] });
    client = new BlobServiceClientWrapper(new BlobServiceClient(baseUrl));
    getUserDelegationKey = stub(client, "getUserDelegationKey").callsFake(() =>
      Promise.resolve(delegationKey())
    );
  });

  afterEach(() => {
    restore();
  });

  function credentialStorage(): AzureServerStorage {
    const config: AzureServerStorageCredentialConfig = {
      accountName,
      baseUrl,
      credential,
    };
    return new AzureServerStorage(config, client);
  }

  describe("shared key", () => {
    it("should sign all SAS outputs with the account key", async () => {
      const config: AzureServerStorageConfig = {
        accountName,
        accountKey,
        baseUrl,
      };
      await expectAllSasOutputs(
        new AzureServerStorage(config, client),
        sharedKeySigner
      );
      expect(getUserDelegationKey.called).to.be.false;
    });

    it("should use the account key when credential is also present", async () => {
      const config = { accountName, accountKey, baseUrl, credential };
      await expectAllSasOutputs(
        new AzureServerStorage(config, client),
        sharedKeySigner
      );
      expect(getUserDelegationKey.called).to.be.false;
    });

    it("should use shared key when accountKey is present but empty", async () => {
      const config = { accountName, accountKey: "", baseUrl, credential };
      await new AzureServerStorage(config, client).getDownloadUrl(reference);
      expect(getUserDelegationKey.called).to.be.false;
    });

    it("should keep the existing error when neither accountKey nor credential is present", async () => {
      const config = {
        accountName,
        baseUrl,
      } as unknown as AzureServerStorageConfig;
      await expect(
        new AzureServerStorage(config, client).getDownloadUrl(reference)
      ).to.eventually.be.rejectedWith(TypeError);
      expect(getUserDelegationKey.called).to.be.false;
    });
  });

  describe("token credential", () => {
    it("should sign all SAS outputs with a user delegation key", async () => {
      await expectAllSasOutputs(credentialStorage(), delegationSigner);
    });

    it("should request a 7 day key started 5 minutes ago", async () => {
      await credentialStorage().getDownloadUrl(reference);

      expect(getUserDelegationKey.calledOnce).to.be.true;
      const [startsOn, expiresOn] = getUserDelegationKey.firstCall.args as [
        Date,
        Date
      ];
      expect(startsOn.getTime()).to.equal(now - 5 * 60 * 1000);
      expect(expiresOn.getTime()).to.equal(now - 5 * 60 * 1000 + 7 * day);
    });

    it("should reuse the key while it outlives the requested SAS", async () => {
      const storage = credentialStorage();
      await storage.getDownloadUrl(reference);
      clock.tick(6 * day + 22 * hour);
      await storage.getUploadUrl(reference);

      expect(getUserDelegationKey.calledOnce).to.be.true;
    });

    it("should request a new key when the SAS would outlive the cached key", async () => {
      const storage = credentialStorage();
      await storage.getDownloadUrl(reference);
      clock.tick(6 * day + 23 * hour);
      await storage.getDownloadUrl(reference);

      expect(getUserDelegationKey.calledTwice).to.be.true;
    });

    it("should share one key request between concurrent callers", async () => {
      const storage = credentialStorage();
      await Promise.all([
        storage.getDownloadUrl(reference),
        storage.getDirectoryAccessConfig(directory),
      ]);

      expect(getUserDelegationKey.calledOnce).to.be.true;
    });

    it("should reject all waiters on failure and retry on the next call", async () => {
      const error = new Error("key request failed");
      getUserDelegationKey.onFirstCall().rejects(error);
      const storage = credentialStorage();

      const download = storage.getDownloadUrl(reference);
      const upload = storage.getUploadUrl(reference);
      await expect(download).to.eventually.be.rejectedWith(
        Error,
        "key request failed"
      );
      await expect(upload).to.eventually.be.rejectedWith(
        Error,
        "key request failed"
      );

      await storage.getDownloadUrl(reference);
      expect(getUserDelegationKey.calledTwice).to.be.true;
    });

    it("should allow SAS expiry up to 7 days minus 5 minutes", async () => {
      await credentialStorage().getDownloadUrl(reference, {
        expiresOn: new Date(now + maxCredentialExpiry),
      });
      expect(getUserDelegationKey.calledOnce).to.be.true;
    });

    it("should reject SAS expiry of 7 days without requesting a key", async () => {
      await expect(
        credentialStorage().getDownloadUrl(reference, {
          expiresInSeconds: 7 * 24 * 60 * 60,
        })
      ).to.eventually.be.rejectedWith(
        Error,
        "SAS expiry exceeds user delegation key expiry"
      );
      expect(getUserDelegationKey.called).to.be.false;
    });
  });
});
