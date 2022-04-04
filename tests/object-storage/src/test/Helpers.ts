/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomUUID } from "crypto";
import { existsSync, promises, rmSync } from "fs";
import * as path from "path";
import { Readable } from "stream";

import { expect } from "chai";

import {
  BaseDirectory,
  Metadata,
  ObjectReference,
  streamToBuffer,
  TransferData,
} from "@itwin/object-storage-core";

import { config } from "./Config";

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

export class TestDirectory {
  constructor(public readonly baseDirectory: BaseDirectory) {}

  public async uploadFile(
    reference: Pick<ObjectReference, "relativeDirectory" | "objectName">,
    content: Buffer | undefined,
    metadata: Metadata | undefined
  ): Promise<ObjectReference> {
    const contentToUpload: Buffer =
      content ?? Buffer.from(`test file payload ${randomUUID()}`);
    const objectReference: ObjectReference = {
      baseDirectory: this.baseDirectory.baseDirectory,
      ...reference,
    };

    await serverStorage.upload(objectReference, contentToUpload, metadata);
    return objectReference;
  }
}

export class TestRemoteDirectoryManager {
  private _createdDirectories: BaseDirectory[] = [];

  public async createNew(): Promise<TestDirectory> {
    const newDirectory: BaseDirectory = {
      baseDirectory: `integration-tests-${randomUUID()}`,
    };
    this.addForDelete(newDirectory);

    await serverStorage.createBaseDirectory(newDirectory);
    return new TestDirectory(newDirectory);
  }

  public addForDelete(directory: BaseDirectory): void {
    this._createdDirectories.push(directory);
  }

  public async purgeCreatedDirectories(): Promise<void> {
    for (const directoryToDelete of this._createdDirectories)
      await serverStorage.deleteBaseDirectory(directoryToDelete);
    this._createdDirectories = [];
  }
}

export class TestLocalFileManager {
  private readonly _downloadsDir: string;
  private readonly _uploadsDir: string;

  constructor(rootDir: string) {
    this._downloadsDir = path.join(rootDir, "downloads");
    this._uploadsDir = path.join(rootDir, "uploads");
  }

  public async getDownloadsDir(): Promise<string> {
    if (!existsSync(this._downloadsDir))
      await promises.mkdir(this._downloadsDir, { recursive: true });

    return this._downloadsDir;
  }

  public async createAndWriteFile(
    fileName: string,
    content: Buffer
  ): Promise<string> {
    if (!existsSync(this._uploadsDir))
      await promises.mkdir(this._uploadsDir, { recursive: true });

    const filePath = path.join(this._uploadsDir, fileName);
    await promises.writeFile(filePath, content);
    return filePath;
  }

  public async purgeCreatedFiles(): Promise<void> {
    this.purgeDirectory(this._downloadsDir);
    this.purgeDirectory(this._uploadsDir);
  }

  private purgeDirectory(directory: string): void {
    rmSync(directory, { recursive: true, force: true });
  }
}
