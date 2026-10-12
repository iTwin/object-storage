/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";
import { expect } from "chai";

import { ObjectReference } from "@itwin/object-storage-core";

import { AzureTransferConfig, Constants } from "../../../common";
import { buildBlobUrl } from "../../../common/internal";

describe(`${buildBlobUrl.name}()`, () => {
  const authentication = "sv=2024-01-01&sr=c&sp=r&sig=testSignature";
  const transferConfig: AzureTransferConfig = {
    storageType: Constants.storageType,
    baseUrl: "https://testaccount.blob.core.windows.net",
    expiration: new Date(Date.now() + 60 * 60 * 1000),
    authentication,
  };

  [
    { objectName: "file name.bim" },
    { objectName: "100%41.bim" },
    { objectName: "what?.bim" },
    { objectName: "hash#1.bim" },
    { objectName: "a+b.bim" },
    { objectName: "\u00fcn\u00efcode.bim" },
    { relativeDirectory: "dir one/sub?dir", objectName: "file#1.bim" },
  ].forEach((testCase) => {
    const reference: ObjectReference = {
      baseDirectory: "testcontainer",
      ...testCase,
    };
    const expectedBlobName = reference.relativeDirectory
      ? `${reference.relativeDirectory}/${reference.objectName}`
      : reference.objectName;

    it(`should address the referenced blob (${expectedBlobName})`, () => {
      const url = buildBlobUrl({ transferConfig, reference });
      const client = new BlockBlobClient(url);

      expect(client.containerName).to.equal(reference.baseDirectory);
      expect(client.name).to.equal(expectedBlobName);
      expect(new URL(url).search).to.equal(`?${authentication}`);
    });
  });
});
