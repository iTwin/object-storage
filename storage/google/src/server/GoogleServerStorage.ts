/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Readable } from "stream";

import {
  assertBaseDirectory,
  assertObjectReference,
  assertRelativeDirectory,
  buildObjectDirectoryString,
} from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  assertLocalFile,
  bufferToTransferType,
  getExpiryDate,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  BaseDirectory,
  ContentHeaders,
  CopyObjectOptions,
  EntityPageListIterator,
  ExpiryOptions,
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectDirectory,
  ObjectProperties,
  ObjectReference,
  ServerStorage,
  TransferConfig,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { GoogleTransferConfig } from "../common";

import { StorageWrapper } from "./wrappers";
import { GoogleStorageConfig } from "./wrappers/GoogleStorageConfig";
import { StorageControlClientWrapper } from "./wrappers/StorageControlClientWrapper";

export class GoogleServerStorage extends ServerStorage {
  private readonly _bucketName: string;

  constructor(
    private readonly _storage: StorageWrapper,
    private readonly _storageControl: StorageControlClientWrapper,
    config: GoogleStorageConfig
  ) {
    super();
    this._bucketName = config.bucketName;
  }

  public get bucketName(): string {
    return this._bucketName;
  }

  public download(
    reference: ObjectReference,
    transferType: "buffer"
  ): Promise<Buffer>;

  public download(
    reference: ObjectReference,
    transferType: "stream"
  ): Promise<Readable>;

  public async download(
    reference: ObjectReference,
    transferType: "local",
    localPath?: string
  ): Promise<string>;

  public override async download(
    reference: ObjectReference,
    transferType: TransferType,
    localPath?: string
  ): Promise<TransferData> {
    assertObjectReference(reference);
    if (transferType === "local") {
      assertLocalFile(localPath);
      await this._storage.downloadFile(reference, localPath);
      return localPath;
    }

    const downloadBuffer = await this._storage.downloadFile(reference);

    return bufferToTransferType(downloadBuffer, transferType);
  }

  public override async upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Metadata,
    headers?: ContentHeaders
  ): Promise<void> {
    assertObjectReference(reference);
    if (typeof data === "string") await assertFileNotEmpty(data);

    await this._storage.uploadFile(reference, data, metadata, headers);
  }

  public override async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions,
    headers?: ContentHeaders
  ): Promise<void> {
    assertObjectReference(reference);
    if (typeof data === "string") await assertFileNotEmpty(data);

    await this._storage.uploadFile(
      reference,
      data,
      options?.metadata,
      headers,
      options?.partSize
    );
  }

  public override async createBaseDirectory(
    directory: BaseDirectory
  ): Promise<void> {
    assertBaseDirectory(directory.baseDirectory);
    return this._storageControl.createManagedFolder(directory.baseDirectory);
  }

  public override getListDirectoriesPagedIterator(
    _maxPageSize: number
  ): EntityPageListIterator<BaseDirectory> {
    return new EntityPageListIterator<BaseDirectory>(async () => {
      return this._storageControl.getManagedFoldersNextPage({
        maxPageSize: _maxPageSize,
      });
    });
  }

  public override getListObjectsPagedIterator(
    directory: BaseDirectory,
    maxPageSize: number
  ): EntityPageListIterator<ObjectReference> {
    assertBaseDirectory(directory.baseDirectory);
    return new EntityPageListIterator<ObjectReference>(async () => {
      return this._storage.getFilesNextPage({
        directory: directory,
        maxPageSize: maxPageSize,
      });
    });
  }

  public override list(directory: BaseDirectory): Promise<ObjectReference[]> {
    return this.listObjects(directory);
  }

  public override async deleteBaseDirectory(
    directory: BaseDirectory
  ): Promise<void> {
    assertBaseDirectory(directory.baseDirectory);
    for await (const objectPage of this.getListObjectsPagedIterator(
      directory,
      100
    )) {
      for (const object of objectPage) {
        await this._storage.deleteFile(object);
      }
    }

    return this._storageControl.deleteManagedFolder(directory.baseDirectory);
  }

  public override deleteObject(reference: ObjectReference): Promise<void> {
    assertObjectReference(reference);
    return this._storage.deleteFile(reference);
  }

  public override async baseDirectoryExists(
    directory: BaseDirectory
  ): Promise<boolean> {
    assertBaseDirectory(directory.baseDirectory);
    return await this._storageControl.managedFolderExists(
      directory.baseDirectory
    );
  }

  public override async objectExists(
    reference: ObjectReference
  ): Promise<boolean> {
    assertObjectReference(reference);
    return await this._storage.fileExists(reference);
  }

  public override async copyObject(
    sourceStorage: ServerStorage,
    sourceReference: ObjectReference,
    targetReference: ObjectReference,
    _options?: CopyObjectOptions
  ): Promise<void> {
    assertObjectReference(sourceReference);
    assertObjectReference(targetReference);

    if (!(sourceStorage instanceof GoogleServerStorage)) {
      throw new Error(
        `Source storage must be an instance of ${GoogleServerStorage.name} to use ${GoogleServerStorage.prototype.copyObject.name} method.`
      );
    }

    return await this._storage.copyFile(
      sourceStorage.bucketName,
      sourceReference,
      targetReference
    );
  }

  public override async updateMetadata(
    reference: ObjectReference,
    metadata: Metadata
  ): Promise<void> {
    assertObjectReference(reference);
    return await this._storage.updateMetadata(reference, metadata);
  }

  public override async getObjectProperties(
    reference: ObjectReference
  ): Promise<ObjectProperties> {
    assertObjectReference(reference);
    return await this._storage.getObjectProperties(reference);
  }

  public override async getDownloadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    assertObjectReference(reference);
    return await this._storage.getSignedUrl("read", reference, expiry);
  }

  public override async getUploadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    assertObjectReference(reference);
    return await this._storage.getSignedUrl("write", reference, expiry);
  }

  public override async getDownloadConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<GoogleTransferConfig> {
    assertBaseDirectory(directory.baseDirectory);
    assertRelativeDirectory(directory.relativeDirectory);
    getExpiryDate(expiry);

    const directoryPath = buildObjectDirectoryString(directory);
    return await this._storageControl.createAccessToken("read", directoryPath);
  }

  public override async getUploadConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<TransferConfig> {
    assertBaseDirectory(directory.baseDirectory);
    assertRelativeDirectory(directory.relativeDirectory);
    getExpiryDate(expiry);

    const directoryPath = buildObjectDirectoryString(directory);
    return await this._storageControl.createAccessToken("write", directoryPath);
  }

  public override async getDirectoryAccessConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<TransferConfig> {
    assertBaseDirectory(directory.baseDirectory);
    assertRelativeDirectory(directory.relativeDirectory);
    getExpiryDate(expiry);

    const directoryPath = buildObjectDirectoryString(directory);
    return await this._storageControl.createAccessToken("user", directoryPath);
  }

  public override async releaseResources(): Promise<void> {
    await this._storageControl.releaseResources();
  }
}
