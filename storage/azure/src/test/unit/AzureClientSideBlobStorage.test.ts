/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { TransferConfig, TransferType } from "@itwin/object-storage-core";

import { AzureClientSideBlobStorage } from "../..";

use(chaiAsPromised);

describe(`${AzureClientSideBlobStorage.name}`, () => {
  const azureClientSideBlobStorage = new AzureClientSideBlobStorage();

  describe(`${azureClientSideBlobStorage.download.name}()`, () => {
    describe("using ConfigDownloadInput", async () => {
      [
        {
          transferConfig: undefined,
          expectedErrorMessage: "transferConfig is falsy",
        },
        {
          transferConfig: "some string",
          expectedErrorMessage: "transferConfig should be of type 'object'",
        },
        {
          transferConfig: {
            baseUrl: "testBaseUrl",
            expiration: new Date(),
          },
          expectedErrorMessage: "transferConfig.authentication is falsy",
        },
        {
          transferConfig: {
            baseUrl: "testBaseUrl",
            expiration: new Date(),
            authentication: {
              key: "testKey",
            },
          },
          expectedErrorMessage:
            "transferConfig.authentication should be of type 'string'",
        },
      ].forEach((testCase) => {
        it(`should throw if transfer config is invalid (${testCase.expectedErrorMessage})`, async () => {
          const transferType: TransferType = "buffer";
          const input = {
            reference: {
              baseDirectory: "testBaseDirectory",
              objectName: "testObjectName",
            },
            transferType,
            transferConfig: testCase.transferConfig as TransferConfig,
          };
          const testedFunction = azureClientSideBlobStorage.download(input);
          await expect(testedFunction).to.eventually.be.rejected.with.property(
            "message",
            testCase.expectedErrorMessage
          );
        });
      });
    });
  });
});
