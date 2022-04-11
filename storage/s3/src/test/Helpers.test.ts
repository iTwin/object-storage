/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { TransferConfig } from "@itwin/object-storage-core";

import { assertS3TransferConfig } from "..";
import { S3TransferConfig } from "../Interfaces";

use(chaiAsPromised);

describe("Helper functions", () => {
  describe(`${assertS3TransferConfig.name}()`, () => {
    const validBaseTransferConfig: TransferConfig = {
      baseUrl: "http://foo.bar",
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
          authentication: "some string",
        },
        expectedErrorMessage:
          "transferConfig.authentication should be of type 'object'",
      },
      {
        transferConfig: {
          ...validBaseTransferConfig,
          authentication: {},
        },
        expectedErrorMessage:
          "transferConfig.authentication.accessKey is falsy",
      },
      {
        transferConfig: {
          ...validBaseTransferConfig,
          authentication: {
            accessKey: "testAccessKey",
          },
        },
        expectedErrorMessage:
          "transferConfig.authentication.secretKey is falsy",
      },
      {
        transferConfig: {
          ...validBaseTransferConfig,
          authentication: {
            accessKey: "testAccessKey",
            secretKey: "testSecretKey",
          },
        },
        expectedErrorMessage:
          "transferConfig.authentication.sessionToken is falsy",
      },
      {
        transferConfig: {
          ...validBaseTransferConfig,
          authentication: {
            accessKey: "testAccessKey",
            secretKey: "testSecretKey",
            sessionToken: "testSessionToken",
          },
        },
        expectedErrorMessage: "transferConfig.region is falsy",
      },
    ].forEach((testCase) => {
      it(`should throw if transfer config is invalid (${testCase.expectedErrorMessage})`, () => {
        const testedFunction = () =>
          assertS3TransferConfig(testCase.transferConfig as S3TransferConfig);
        expect(testedFunction)
          .to.throw(Error)
          .with.property("message", testCase.expectedErrorMessage);
      });
    });

    it("should not throw if transfer config is valid", () => {
      const transferConfig: S3TransferConfig = {
        ...validBaseTransferConfig,
        authentication: {
          accessKey: "testAccessKey",
          secretKey: "testSecretKey",
          sessionToken: "testSessionToken",
        },
        region: "testRegion",
      };
      const testedFunction = () => assertS3TransferConfig(transferConfig);
      expect(testedFunction).to.not.throw();
    });
  });
});
