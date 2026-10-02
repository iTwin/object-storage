/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

export async function testRelativeDirectoryValidation(
  testedFunction: () => Promise<unknown>,
): Promise<void> {
  const functionPromise = testedFunction();
  await expect(functionPromise).to.eventually.be.rejectedWith(
    Error,
    "Relative directory cannot contain backslashes.",
  );
}

export async function testObjectNameValidation(
  testedFunction: () => Promise<unknown>,
): Promise<void> {
  await expect(
    (async () => await testedFunction())(),
  ).to.eventually.be.rejectedWith(
    Error,
    "Object name cannot contain empty, '.' or '..' path segments.",
  );
}

export async function testBaseDirectoryValidation(
  testedFunction: (baseDirectory: string) => unknown,
): Promise<void> {
  await expect(
    (async () => await testedFunction(""))(),
  ).to.eventually.be.rejectedWith(Error, "Base directory cannot be empty.");
  await expect(
    (async () => await testedFunction("testBaseDirectory/"))(),
  ).to.eventually.be.rejectedWith(
    Error,
    "Base directory cannot contain slashes at the beginning or the end of the string.",
  );
}
