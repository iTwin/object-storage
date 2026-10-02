/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect } from "chai";

import {
  assertObjectName,
  assertObjectReference,
  assertRelativeDirectory,
} from "../../../common/internal";

const segmentsMessage = (description: string) =>
  `${description} cannot contain empty, '.' or '..' path segments.`;
const controlCharactersMessage = (description: string) =>
  `${description} cannot contain control characters.`;

describe("Path validation", () => {
  describe(`${assertRelativeDirectory.name}()`, () => {
    [
      { value: "foo//bar", message: segmentsMessage("Relative directory") },
      { value: "foo/./bar", message: segmentsMessage("Relative directory") },
      { value: "foo/../bar", message: segmentsMessage("Relative directory") },
      { value: "..", message: segmentsMessage("Relative directory") },
      { value: ".", message: segmentsMessage("Relative directory") },
      {
        value: "foo\nbar",
        message: controlCharactersMessage("Relative directory"),
      },
      {
        value: "foo\u0000bar",
        message: controlCharactersMessage("Relative directory"),
      },
      {
        value: "foo\u007fbar",
        message: controlCharactersMessage("Relative directory"),
      },
    ].forEach((testCase) => {
      it(`should throw if relative directory has invalid segments (${JSON.stringify(
        testCase.value,
      )})`, () => {
        expect(() => assertRelativeDirectory(testCase.value))
          .to.throw(Error)
          .with.property("message", testCase.message);
      });
    });

    ["foo.bar", "foo/..bar", "foo/bar..", "...", "foo bar/baz"].forEach(
      (relativeDirectory) => {
        it(`should not throw if relative directory is valid (${relativeDirectory})`, () => {
          expect(() =>
            assertRelativeDirectory(relativeDirectory),
          ).to.not.throw();
        });
      },
    );
  });

  describe(`${assertObjectName.name}()`, () => {
    [
      { value: undefined, message: "Object name cannot be empty." },
      { value: "", message: "Object name cannot be empty." },
      { value: "/file", message: segmentsMessage("Object name") },
      { value: "file/", message: segmentsMessage("Object name") },
      { value: "dir//file", message: segmentsMessage("Object name") },
      { value: "../file", message: segmentsMessage("Object name") },
      { value: ".", message: segmentsMessage("Object name") },
      { value: "..", message: segmentsMessage("Object name") },
      { value: "file\r\n", message: controlCharactersMessage("Object name") },
    ].forEach((testCase) => {
      it(`should throw if object name is invalid (${JSON.stringify(
        testCase.value,
      )})`, () => {
        expect(() => assertObjectName(testCase.value))
          .to.throw(Error)
          .with.property("message", testCase.message);
      });
    });

    [
      "file.bim",
      "dir/file.bim",
      ".hidden",
      "file name.bim",
      "100%.bim",
    ].forEach((objectName) => {
      it(`should not throw if object name is valid (${objectName})`, () => {
        expect(() => assertObjectName(objectName)).to.not.throw();
      });
    });
  });

  describe(`${assertObjectReference.name}()`, () => {
    it("should validate relative directory before object name", () => {
      expect(() =>
        assertObjectReference({
          baseDirectory: "base",
          relativeDirectory: "a\\b",
          objectName: "",
        }),
      )
        .to.throw(Error)
        .with.property(
          "message",
          "Relative directory cannot contain backslashes.",
        );
    });

    it("should throw if object name is invalid", () => {
      expect(() =>
        assertObjectReference({
          baseDirectory: "base",
          relativeDirectory: "a/b",
          objectName: "../c",
        }),
      )
        .to.throw(Error)
        .with.property("message", segmentsMessage("Object name"));
    });

    it("should not throw for a valid reference", () => {
      expect(() =>
        assertObjectReference({
          baseDirectory: "base",
          relativeDirectory: "tiles/0x1c/abc",
          objectName: "content-id",
        }),
      ).to.not.throw();
    });
  });
});
