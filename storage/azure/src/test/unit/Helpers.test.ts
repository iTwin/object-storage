/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { TransferType } from "@itwin/object-storage-core";

import { AzureTransferConfig, buildBlobUrlFromConfig } from "../..";

use(chaiAsPromised);

describe("Helper functions", () => {
  describe(`${buildBlobUrlFromConfig.name}()`, () => {
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
      it(`should throw if transfer config is invalid (${testCase.expectedErrorMessage})`, () => {
        const transferType: TransferType = "buffer";
        const input = {
          reference: {
            baseDirectory: "testBaseDirectory",
            objectName: "testObjectName",
          },
          transferType,
          transferConfig:
            testCase.transferConfig as unknown as AzureTransferConfig,
        };
        const testedFunction = () => buildBlobUrlFromConfig(input);
        expect(testedFunction)
          .to.throw(Error)
          .with.property("message", testCase.expectedErrorMessage);
      });
    });
  });
});
