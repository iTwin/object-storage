/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { TokenCredential } from "@azure/core-auth";
import { StorageSharedKeyCredential } from "@azure/storage-blob";
import { expect } from "chai";

import {
  BlobServiceClientWrapper,
  BlobServiceClientWrapperFactory,
} from "../../../server";

const accountName = "account";
const accountKey = Buffer.from("test-account-key").toString("base64");
const baseUrl = `https://${accountName}.blob.core.windows.net`;
const credential: TokenCredential = {
  getToken: () => {
    throw new Error("credential must not be used to sign SAS");
  },
};

describe(`${BlobServiceClientWrapperFactory.name}`, () => {
  function clientCredential(wrapper: BlobServiceClientWrapper): unknown {
    return wrapper.getContainerClient("container").credential;
  }

  it("should authenticate with the token credential", () => {
    const wrapper = new BlobServiceClientWrapperFactory().create({
      accountName,
      baseUrl,
      credential,
    });
    expect(clientCredential(wrapper)).to.equal(credential);
  });

  it("should throw if credential is undefined", () => {
    expect(() =>
      new BlobServiceClientWrapperFactory().create({
        accountName,
        baseUrl,
        credential: undefined as unknown as TokenCredential,
      })
    ).to.throw("credential is not defined in configuration");
  });

  it("should authenticate with the account key", () => {
    const wrapper = new BlobServiceClientWrapperFactory().create({
      accountName,
      accountKey,
      baseUrl,
    });
    const used = clientCredential(wrapper);
    expect(used).to.be.instanceOf(StorageSharedKeyCredential);
    expect((used as StorageSharedKeyCredential).accountName).to.equal(
      accountName
    );
  });
});
