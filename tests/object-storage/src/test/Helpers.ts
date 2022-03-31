/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";
import { randomUUID } from "crypto";
import { existsSync, promises } from "fs";
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

export function uploadTestObjectReference(reference: ObjectReference): Promise<void> {
  return serverStorage.upload(
    reference,
    Buffer.from(`test file payload ${randomUUID()}`)
  );
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
  constructor(
    public readonly baseDirectory: BaseDirectory
  ) { }

  public async uploadFile(reference: Pick<ObjectReference, "relativeDirectory" | "objectName">, content: Buffer, metadata: Metadata | undefined): Promise<ObjectReference> {
    const objectReference: ObjectReference = {
      baseDirectory: this.baseDirectory.baseDirectory,
      relativeDirectory: reference.relativeDirectory,
      objectName: reference.objectName
    };

    await serverStorage.upload(objectReference, content, metadata);
    return objectReference;
  }
}

export class TestDirectoryManager {
  private _createdDirectories: BaseDirectory[] = [];



  public async createNewDirectory(): Promise<TestDirectory> {
    (Object.prototype as any).foo = "aa";
    const newDirectory: BaseDirectory = {
      baseDirectory: `integration-tests-${randomUUID()}`,
    };
    this._createdDirectories.push(newDirectory);

    await serverStorage.create(newDirectory);
    return new TestDirectory(newDirectory);
  }


  public async purgeCreatedDirectories(): Promise<void> {
    for (const directoryToDelete of this._createdDirectories)
      await serverStorage.deleteBaseDirectory(directoryToDelete);
    this._createdDirectories = [];
  }
}

export class TestLocalFileManager {
  private _createdFiles: string[] = [];

  constructor(private readonly _rootDir: string) {

  }

  public async createAndWriteFile(fileName: string, content: string): Promise<void> {
    if (!existsSync(this._rootDir))
      await promises.mkdir(this._rootDir, { recursive: true });

    const filePath = path.join(this._rootDir, fileName);
    this._createdFiles.push(filePath);

    const contentBuffer = Buffer.from(content);
    await promises.writeFile(filePath, contentBuffer);
  }

  public async createAndWriteFileBuffer(fileName: string, content: Buffer): Promise<string> { // TODO: overloads?
    if (!existsSync(this._rootDir))
      await promises.mkdir(this._rootDir, { recursive: true });

    const filePath = path.join(this._rootDir, fileName);
    this._createdFiles.push(filePath);

    await promises.writeFile(filePath, content);
    return filePath;
  }

  public async purgeCreatedFiles(): Promise<void> {
    for (const fileToDelete in this._createdFiles) {
      if (existsSync(fileToDelete)) // TODO: looks stupid
        await promises.unlink(fileToDelete);
    }
    this._createdFiles = [];

  }
}