/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { expect } from "chai";

import { escapeCelStringLiteral } from "../../../server/wrappers/StorageControlClientWrapper";

describe("escapeCelStringLiteral", () => {
  [
    { input: "folder", expected: "folder" },
    { input: "folder/sub", expected: "folder/sub" },
    { input: "foo bar", expected: "foo bar" },
    { input: "foo`bar", expected: "foo`bar" },
    { input: "foo'bar", expected: "foo\\'bar" },
    {
      input: "x') || resource.name.startsWith('",
      expected: "x\\') || resource.name.startsWith(\\'",
    },
    { input: "back\\slash", expected: "back\\\\slash" },
    { input: "both'\\end", expected: "both\\'\\\\end" },
  ].forEach((testCase) => {
    it(`should escape (${testCase.input})`, () => {
      expect(escapeCelStringLiteral(testCase.input)).to.equal(
        testCase.expected
      );
    });
  });
});
