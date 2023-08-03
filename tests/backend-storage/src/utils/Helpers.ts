/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect } from "chai";

import { ObjectReference } from "@itwin/object-storage-core";

import { TestRemoteDirectory } from "./TestRemoteDirectory";

export async function createObjectsReferences(
  testDirectory: TestRemoteDirectory,
  n: number
): Promise<ObjectReference[]> {
  const references: ObjectReference[] = [];
  for (let i = 0; i < n; i++) {
    references.push(
      await testDirectory.uploadFile(
        { objectName: `reference${i}` },
        undefined,
        undefined
      )
    );
  }
  return references;
}

export function assertQueriedObjects(
  queriedReferences: ObjectReference[],
  uploadedReferences: ObjectReference[]
): void {
  expect(queriedReferences.length).to.be.equal(uploadedReferences.length);
  for (const uploadedReference of uploadedReferences) {
    const queriedReference = queriedReferences.find(
      (ref) => ref.objectName === uploadedReference.objectName
    );
    expect(queriedReference).to.be.deep.equal(uploadedReference);
  }
}
