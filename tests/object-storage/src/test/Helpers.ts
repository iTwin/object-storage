/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomUUID } from "crypto";
import { promises } from "fs";
import { Readable } from "stream";

import { expect } from "chai";

import {
  BaseDirectory,
  Metadata,
  ObjectDirectory,
  ObjectReference,
  streamToBuffer,
  TransferData,
} from "@itwin/object-storage-core";

import { config } from "./Config";

const { serverStorage } = config;

export async function checkUploadedFileValidity(
  reference: ObjectReference,
  contentBuffer: Buffer,
  metadata: Metadata
): Promise<void> {
  expect(await serverStorage.objectExists(reference)).to.be.true;

  const downloadedBuffer = await serverStorage.download(reference, "buffer");
  expect(downloadedBuffer.equals(contentBuffer)).to.be.true;

  const { metadata: _metadata } = await serverStorage.getObjectProperties(
    reference
  );
  expect(_metadata).to.eql(metadata);
}

export function assertBuffer(
  response: TransferData,
  contentBuffer: Buffer
): void {
  expect(response instanceof Buffer).to.be.true;
  expect(contentBuffer.equals(response as Buffer)).to.be.true;
}

export async function assertStream(
  response: TransferData,
  contentBuffer: Buffer
): Promise<void> {
  expect(response instanceof Readable).to.be.true;
  const downloadedBuffer = await streamToBuffer(response as Readable);
  expect(contentBuffer.equals(downloadedBuffer)).to.be.true;
}

export async function assertLocalFile(
  response: TransferData,
  contentBuffer: Buffer
): Promise<void> {
  expect(contentBuffer.equals(await promises.readFile(response as string)));
}

export class TestDirectoryManager {
  private _createdDirectories: BaseDirectory[] = [];

  public async createNewDirectory(): Promise<ObjectDirectory> {
    const newDirectory: BaseDirectory = {
      baseDirectory: randomUUID(),
    };
    this._createdDirectories.push(newDirectory);

    await serverStorage.createBaseDirectory(newDirectory);

    return {
      ...newDirectory,
      relativeDirectory: "foobar",
    };
  }

  public async purgeCreatedDirectories(): Promise<void> {
    for (const directoryToDelete of this._createdDirectories)
      await serverStorage.deleteBaseDirectory(directoryToDelete);
    this._createdDirectories = [];
  }
}
