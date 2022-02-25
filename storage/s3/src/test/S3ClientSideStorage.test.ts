/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { TransferConfig, TransferType } from "@itwin/object-storage-core";

import { S3ClientSideStorage } from "../S3ClientSideStorage";

use(chaiAsPromised);

describe(`${S3ClientSideStorage.name}`, () => {
  const s3ClientSideStorage = new S3ClientSideStorage({
    bucket: "testBucket",
  });

  describe(`${s3ClientSideStorage.download.name}()`, () => {
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
          const testedFunction = s3ClientSideStorage.download(input);
          await expect(testedFunction).to.eventually.be.rejected.with.property(
            "message",
            testCase.expectedErrorMessage
          );
        });
      });
    });
  });
});
