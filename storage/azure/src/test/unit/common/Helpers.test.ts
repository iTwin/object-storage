/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { TransferConfig } from "@itwin/object-storage-core";

import {
  AzureTransferConfig,
  buildBlobUrlFromAzureTransferConfigInput,
} from "../../../common";

use(chaiAsPromised);

describe("Helper functions", () => {
  describe("buildBlobUrlFromAzureTransferConfigInput()", () => {
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
        const reference = {
          baseDirectory: "testBaseDirectory",
          objectName: "testObjectName",
        };
        const testedFunction = () =>
          buildBlobUrlFromAzureTransferConfigInput({
            transferConfig:
              testCase.transferConfig as unknown as AzureTransferConfig,
            reference,
          });
        expect(testedFunction)
          .to.throw(Error)
          .with.property("message", testCase.expectedErrorMessage);
      });
    });

    it("should not throw if transfer config is valid", () => {
      const transferConfig: AzureTransferConfig = {
        ...validBaseTransferConfig,
        authentication: "testAuthentication",
      };
      const reference = {
        baseDirectory: "testBaseDirectory",
        objectName: "testObjectName",
      };
      const testedFunction = () =>
        buildBlobUrlFromAzureTransferConfigInput({ transferConfig, reference });
      expect(testedFunction).to.not.throw();
    });
  });
});
