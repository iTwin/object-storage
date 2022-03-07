/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { TransferConfig, TransferType } from "@itwin/object-storage-core";

import { AzureTransferConfig, buildBlobUrlFromConfig } from "../..";

use(chaiAsPromised);

describe("Helper functions", () => {
  describe(`${buildBlobUrlFromConfig.name}()`, () => {
    const validBaseTransferConfig: TransferConfig = {
      baseUrl: "testBaseUrl",
      expiration: new Date(new Date().getTime() + 5 * 60 * 1000),
    };

    [
      {
        transferConfig: undefined,
        expectedErrorMessage: "transferConfig is falsy",
      },
      {
        transferConfig: validBaseTransferConfig,
        expectedErrorMessage: "transferConfig.authentication is falsy",
      },
      {
        transferConfig: {
          ...validBaseTransferConfig,
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

    it("should not throw if transfer config is valid", () => {
      const transferType: TransferType = "buffer";
      const input = {
        reference: {
          baseDirectory: "testBaseDirectory",
          objectName: "testObjectName",
        },
        transferType,
        transferConfig: {
          ...validBaseTransferConfig,
          authentication: "testAuthentication",
        },
      };
      const testedFunction = () => buildBlobUrlFromConfig(input);
      expect(testedFunction).to.not.throw();
    });
  });
});
