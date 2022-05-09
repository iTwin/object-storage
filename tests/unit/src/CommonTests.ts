/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

export interface ErrorThrownTestCase {
  workflowName: string,
  functionUnderTest: () => Promise<unknown>
}

export async function testRelativeDirectoryValidation(
  ...testCases: ErrorThrownTestCase[]
): Promise<void> {
  for (const testCase of testCases) {
    it(`should throw if relativeDirectory is invalid (${testCase.workflowName})`, async () => {
      const promiseUnderTest = testCase.functionUnderTest();
      await expect(promiseUnderTest)
        .to.eventually.be.rejectedWith(
          Error,
          "TODO ERROR"
        );
    });
  }
}