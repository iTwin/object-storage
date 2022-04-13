/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { assertTransferConfig, TransferConfig } from "../frontend";


use(chaiAsPromised);

describe("Helper functions", () => {
  describe(`${assertTransferConfig.name}()`, () => {
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
        transferConfig: {},
        expectedErrorMessage: "transferConfig.baseUrl is falsy",
      },
      {
        transferConfig: {
          baseUrl: [],
        },
        expectedErrorMessage:
          "transferConfig.baseUrl should be of type 'string'",
      },
      {
        transferConfig: {
          baseUrl: "testBaseUrl",
        },
        expectedErrorMessage: "transferConfig.expiration is falsy",
      },
      {
        transferConfig: {
          baseUrl: "testBaseUrl",
          expiration: {},
        },
        expectedErrorMessage:
          "transferConfig.expiration should be of type 'Date'",
      },
      {
        transferConfig: {
          baseUrl: "testBaseUrl",
          expiration: new Date(new Date().getTime() - 5 * 60 * 1000),
        },
        expectedErrorMessage: "Transfer config is expired",
      },
    ].forEach((testCase) => {
      it(`should throw if transfer config is invalid (${testCase.expectedErrorMessage})`, () => {
        const testedFunction = () =>
          assertTransferConfig(testCase.transferConfig as TransferConfig);
        expect(testedFunction)
          .to.throw(Error)
          .with.property("message", testCase.expectedErrorMessage);
      });
    });

    it("should not throw if transfer config is valid", () => {
      const transferConfig: TransferConfig = {
        baseUrl: "testBaseUrl",
        expiration: new Date(new Date().getTime() + 5 * 60 * 1000),
      };
      const testedFunction = () => assertTransferConfig(transferConfig);
      expect(testedFunction).to.not.throw();
    });
  });
});
