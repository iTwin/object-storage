/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { expect } from "chai";

import { buildAccessBoundaryCondition } from "../../../server/wrappers/StorageControlClientWrapper";

const bucketPath = "projects/_/buckets/test-bucket";

function unescapeCelStringLiteral(value: string): string {
  return value.replace(/\\(.)/g, "$1");
}

function extractPrefix(expression: string, receiver: string): string {
  const escapedReceiver = receiver.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(
    `${escapedReceiver}\\.startsWith\\('((?:[^'\\\\]|\\\\.)*)'\\)`
  ).exec(expression);
  expect(match, `startsWith clause on ${receiver}`).to.not.be.null;
  return unescapeCelStringLiteral(match![1]);
}

// Mirrors CEL semantics of the generated "<clause> || <clause>" expression.
function isAllowed(
  expression: string,
  request: { objectName?: string; listPrefix?: string }
): boolean {
  const resourcePrefix = extractPrefix(expression, "resource.name");
  const listPrefix = extractPrefix(
    expression,
    "api.getAttribute('storage.googleapis.com/objectListPrefix', '')"
  );
  const resourceName =
    request.objectName !== undefined
      ? `${bucketPath}/objects/${request.objectName}`
      : "";
  return (
    resourceName.startsWith(resourcePrefix) ||
    (request.listPrefix ?? "").startsWith(listPrefix)
  );
}

describe(`${buildAccessBoundaryCondition.name}()`, () => {
  it("should terminate both clauses with a directory separator", () => {
    expect(buildAccessBoundaryCondition(bucketPath, "tenant-a")).to.equal(
      `resource.name.startsWith('${bucketPath}/objects/tenant-a/') || ` +
        `api.getAttribute('storage.googleapis.com/objectListPrefix', '')` +
        `.startsWith('tenant-a/')`
    );
  });

  [
    "tenant-a/contract.pdf",
    "tenant-a/nested/dir/file.bim",
    "tenant-a/",
  ].forEach((objectName) => {
    it(`should allow object inside own directory (${objectName})`, () => {
      const expression = buildAccessBoundaryCondition(bucketPath, "tenant-a");
      expect(isAllowed(expression, { objectName })).to.be.true;
    });
  });

  [
    "tenant-ab/contract.pdf",
    "tenant-a2/payroll.xlsx",
    "tenant-a-backup/file.bim",
    "tenant-a",
    "tenant-b/private.dgn",
  ].forEach((objectName) => {
    it(`should deny object outside own directory (${objectName})`, () => {
      const expression = buildAccessBoundaryCondition(bucketPath, "tenant-a");
      expect(isAllowed(expression, { objectName })).to.be.false;
    });
  });

  it("should not grant a single-character directory access to all sibling keys", () => {
    const expression = buildAccessBoundaryCondition(bucketPath, "a");
    expect(isAllowed(expression, { objectName: "a/file" })).to.be.true;
    expect(isAllowed(expression, { objectName: "abc/file" })).to.be.false;
  });

  it("should scope relative directories to their own subtree", () => {
    const expression = buildAccessBoundaryCondition(bucketPath, "tenant-a/sub");
    expect(isAllowed(expression, { objectName: "tenant-a/sub/file" })).to.be
      .true;
    expect(isAllowed(expression, { objectName: "tenant-a/sub2/file" })).to.be
      .false;
    expect(isAllowed(expression, { objectName: "tenant-a/other" })).to.be.false;
  });

  it("should allow listing only own directory", () => {
    const expression = buildAccessBoundaryCondition(bucketPath, "tenant-a");
    expect(isAllowed(expression, { listPrefix: "tenant-a/" })).to.be.true;
    expect(isAllowed(expression, { listPrefix: "tenant-a/sub/" })).to.be.true;
    expect(isAllowed(expression, { listPrefix: "tenant-ab/" })).to.be.false;
  });

  it("should keep directory names with quotes escaped", () => {
    const expression = buildAccessBoundaryCondition(bucketPath, "it's");
    expect(isAllowed(expression, { objectName: "it's/file" })).to.be.true;
    expect(isAllowed(expression, { objectName: "it'sx/file" })).to.be.false;
  });
});
