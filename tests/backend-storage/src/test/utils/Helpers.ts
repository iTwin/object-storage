/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { promises } from "fs";
import { Readable } from "stream";

import { expect } from "chai";

import { streamToBuffer } from "@itwin/object-storage-core/lib/server/internal";

import {
  Metadata,
  ObjectReference,
  TransferData,
} from "@itwin/object-storage-core";

import { config } from "../Config";

const { serverStorage } = config;

export async function checkUploadedFileValidity(
  reference: ObjectReference,
  contentBuffer: Buffer
): Promise<void> {
  expect(await serverStorage.objectExists(reference)).to.be.true;

  const downloadedBuffer = await serverStorage.download(reference, "buffer");
  expect(downloadedBuffer.equals(contentBuffer)).to.be.true;
}

export async function queryAndAssertMetadata(
  reference: ObjectReference,
  expectedMetadata: Metadata
): Promise<void> {
  const { metadata } = await serverStorage.getObjectProperties(reference);
  expect(metadata).to.deep.equal(expectedMetadata);
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
