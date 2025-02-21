/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const testTypes = {
  test: Symbol.for("TestTypes.test"),
  testConfig: Symbol.for("TestTypes.testConfig"),
  namedTestConfig: Symbol.for("TestTypes.namedTestConfig"),
  strategyTestBase: Symbol.for("TestTypes.strategyTestBase"),
};

export { testTypes as TestTypes };
