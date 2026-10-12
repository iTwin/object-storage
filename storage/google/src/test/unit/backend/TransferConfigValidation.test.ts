/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { FrontendUrlTransferClient } from "@itwin/object-storage-core/lib/frontend/internal";

import { GoogleTransferConfig } from "../../../common";
import { GoogleFrontendStorage } from "../../../frontend/GoogleFrontendStorage";
import { StorageWrapperFactory } from "../../../server";

use(chaiAsPromised);

const reference = { baseDirectory: "tenant-a", objectName: "file" };

function createTransferConfig(bucketName: string): GoogleTransferConfig {
  return {
    baseUrl: "//storage.googleapis.com/projects/_/buckets/testBucketName",
    authentication: "Bearer testToken",
    expiration: new Date(Date.now() + 60 * 60 * 1000),
    bucketName,
    storageType: "google",
  };
}

function createFrontendStorage(): {
  storage: GoogleFrontendStorage;
  urls: string[];
} {
  const urls: string[] = [];
  const transferClient = {
    download: (input: { url: string }) => {
      urls.push(input.url);
      return Promise.resolve(new ArrayBuffer(0));
    },
    upload: (url: string) => {
      urls.push(url);
      return Promise.resolve();
    },
  } as unknown as FrontendUrlTransferClient;
  return { storage: new GoogleFrontendStorage(transferClient), urls };
}

describe("Google transfer config validation", () => {
  it(`${StorageWrapperFactory.name} should reject a transfer config without bucketName`, () => {
    const transferConfig = createTransferConfig("testBucketName");
    delete (transferConfig as Partial<GoogleTransferConfig>).bucketName;

    expect(() =>
      new StorageWrapperFactory().createFromToken(transferConfig)
    ).to.throw(Error, "transferConfig.bucketName");
  });

  it(`${GoogleFrontendStorage.name} should reject a transfer config without authentication`, async () => {
    const { storage, urls } = createFrontendStorage();
    const transferConfig = createTransferConfig("testBucketName");
    delete (transferConfig as Partial<GoogleTransferConfig>).authentication;

    await expect(
      storage.download({ reference, transferConfig, transferType: "buffer" })
    ).to.eventually.be.rejectedWith(Error, "transferConfig.authentication");
    expect(urls).to.be.empty;
  });

  it(`${GoogleFrontendStorage.name} should encode the bucket name in request URLs`, async () => {
    const { storage, urls } = createFrontendStorage();
    const transferConfig = createTransferConfig("bucket/../other?x=1");

    await storage.download({
      reference,
      transferConfig,
      transferType: "buffer",
    });
    await storage.upload({
      reference,
      transferConfig,
      data: new ArrayBuffer(1),
    });

    expect(urls).to.deep.equal([
      "https://storage.googleapis.com/storage/v1/b/bucket%2F..%2Fother%3Fx%3D1/o/tenant-a%2Ffile?alt=media",
      "https://storage.googleapis.com/upload/storage/v1/b/bucket%2F..%2Fother%3Fx%3D1/o?uploadType=media&name=tenant-a%2Ffile",
    ]);
  });
});
