/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { randomUUID } from "crypto";

import { expect } from "chai";

import { Metadata, ObjectReference } from "@itwin/object-storage-core";

import { config } from "./Config";

const { serverSideStorage } = config;

export async function checkUploadedFileValidity(
  reference: ObjectReference,
  contentBuffer: Buffer,
  metadata: Metadata
): Promise<void> {
  expect(await serverSideStorage.exists(reference)).to.be.true;

  const downloadedBuffer = await serverSideStorage.download(
    reference,
    "buffer"
  );
  expect(downloadedBuffer.equals(contentBuffer)).to.be.true;

  const { metadata: _metadata } = await serverSideStorage.getObjectProperties(
    reference
  );
  expect(_metadata).to.eql(metadata);
}

export class TestDirectoryManager {
  private _createdDirectories: string[] = [];

  public async createNewDirectory(): Promise<string> {
    const newDirectoryName = randomUUID();
    this._createdDirectories.push(newDirectoryName);

    await serverSideStorage.createBaseDirectory(newDirectoryName);

    return newDirectoryName;
  }

  public async purgeCreatedDirectories(): Promise<void> {
    for (const directoryToDelete of this._createdDirectories)
      await serverSideStorage.deleteBaseDirectory(directoryToDelete);
    this._createdDirectories = [];
  }
}
