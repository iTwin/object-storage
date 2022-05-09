/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const constants = {
  validS3ServerStorageConfig: {
    dependencyName: "",
    baseUrl: "https://testBaseUrl.com",
    region: "testRegion",
    bucket: "testBucket",
    accessKey: "testAccessKey",
    secretKey: "testSecretKey",
    roleArn: "testRoleArn",
    stsBaseUrl: "https://testStsBaseUrl.com",
  } as const,
  invalidObjectReference: {
    baseDirectory: "testBaseDirectory",
    relativeDirectory: "testDirectory1\\testDirectory2",
    objectName: "testObjectName",
  } as const,
} as const;
export { constants as Constants };
