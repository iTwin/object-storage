/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

export async function testRelativeDirectoryValidation(
  testedFunction: () => Promise<unknown>
): Promise<void> {
  const functionPromise = testedFunction();
  await expect(functionPromise).to.eventually.be.rejectedWith(
    Error,
    "Relative directory cannot contain backslashes."
  );
}
