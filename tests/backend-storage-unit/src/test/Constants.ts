/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const constants = {
  invalidObjectReference: {
    baseDirectory: "testBaseDirectory",
    relativeDirectory: "testDirectory1\\testDirectory2",
    objectName: "testObjectName",
  } as const,
} as const;
export { constants as Constants };
