/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { transferConfigToS3ClientWrapper } from "..";
import { S3TransferConfig } from "../Interfaces";

use(chaiAsPromised);

describe("Helper functions", () => {
  describe(`${transferConfigToS3ClientWrapper.name}()`, () => {
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
          authentication: "some string",
        },
        expectedErrorMessage:
          "transferConfig.authentication should be of type 'object'",
      },
      {
        transferConfig: {
          baseUrl: "testBaseUrl",
          expiration: new Date(),
          authentication: {},
        },
        expectedErrorMessage:
          "transferConfig.authentication.accessKey is falsy",
      },
      {
        transferConfig: {
          baseUrl: "testBaseUrl",
          expiration: new Date(),
          authentication: {
            accessKey: "testAccessKey",
          },
        },
        expectedErrorMessage:
          "transferConfig.authentication.secretKey is falsy",
      },
      {
        transferConfig: {
          baseUrl: "testBaseUrl",
          expiration: new Date(),
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
          baseUrl: "testBaseUrl",
          expiration: new Date(),
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
        const testedFunction = () => transferConfigToS3ClientWrapper(
          testCase.transferConfig as S3TransferConfig,
          "testBucket"
        );
        expect(testedFunction)
          .to.throw(Error)
          .with.property("message", testCase.expectedErrorMessage);
      });
    });
  });
});
