/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect } from "chai";

import { assertPolicyResourceDirectory } from "../../../server/internal";

describe(`${assertPolicyResourceDirectory.name}()`, () => {
  ["*", "?", "a*", "foo/?", "foo*bar"].forEach((directory: string) => {
    it(`should throw if directory contains a wildcard (${directory})`, () => {
      const testedFunction = () => assertPolicyResourceDirectory(directory);
      expect(testedFunction)
        .to.throw(Error)
        .with.property(
          "message",
          "Directory cannot contain wildcard characters ('*' or '?')."
        );
    });
  });

  ["foo", "foo/bar", "foo'bar", "foo bar", "12345678-1234-1234"].forEach(
    (directory: string) => {
      it(`should not throw for a valid directory (${directory})`, () => {
        const testedFunction = () => assertPolicyResourceDirectory(directory);
        expect(testedFunction).to.not.throw();
      });
    }
  );
});
