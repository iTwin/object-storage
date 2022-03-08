/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { randomUUID } from "crypto";

import { expect } from "chai";

import {
  Metadata,
  ObjectDirectory,
  ObjectReference,
} from "@itwin/object-storage-core";

import { config } from "./Config";

const { serverStorage } = config;

export async function checkUploadedFileValidity(
  reference: ObjectReference,
  contentBuffer: Buffer,
  metadata: Metadata
): Promise<void> {
  expect(await serverStorage.exists(reference)).to.be.true;

  const downloadedBuffer = await serverStorage.download(reference, "buffer");
  expect(downloadedBuffer.equals(contentBuffer)).to.be.true;

  const { metadata: _metadata } = await serverStorage.getObjectProperties(
    reference
  );
  expect(_metadata).to.eql(metadata);
}

export class TestDirectoryManager {
  private _createdDirectories: ObjectDirectory[] = [];

  public async createNewDirectory(): Promise<ObjectDirectory> {
    const newDirectory: ObjectDirectory = {
      baseDirectory: randomUUID(),
      relativeDirectory: "foobar",
    };
    this._createdDirectories.push(newDirectory);

    await serverStorage.create(newDirectory);

    return newDirectory;
  }

  public async purgeCreatedDirectories(): Promise<void> {
    for (const directoryToDelete of this._createdDirectories)
      await serverStorage.delete(directoryToDelete);
    this._createdDirectories = [];
  }
}
