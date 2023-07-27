/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import { inject, injectable } from "inversify";

import { assertRelativeDirectory } from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  streamToTransferType,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  BaseDirectory,
  ContentHeaders,
  ExpiryOptions,
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectDirectory,
  ObjectProperties,
  ObjectReference,
  PresignedUrlProvider,
  ServerStorage,
  TransferConfig,
  TransferConfigProvider,
  TransferData,
  TransferType,
  EntityPageListIterator,
  Types,
} from "@itwin/object-storage-core";

import { S3ClientWrapper } from "./wrappers";

export interface S3ServerStorageConfig {
  baseUrl: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  roleArn: string;
  stsBaseUrl: string;
}

@injectable()
export class S3ServerStorage extends ServerStorage {
  private readonly _presignedUrlProvider: PresignedUrlProvider;
  private readonly _transferConfigProvider: TransferConfigProvider;
  protected readonly _s3Client: S3ClientWrapper;

  public constructor(
    s3Client: S3ClientWrapper,
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    @inject(Types.Server.presignedUrlProvider)
    presignedUrlProvider: PresignedUrlProvider,
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    @inject(Types.Server.transferConfigProvider)
    transferConfigProvider: TransferConfigProvider
  ) {
    super();

    this._s3Client = s3Client;
    this._presignedUrlProvider = presignedUrlProvider;
    this._transferConfigProvider = transferConfigProvider;
  }

  public download(
    reference: ObjectReference,
    transferType: "buffer"
  ): Promise<Buffer>;

  public download(
    reference: ObjectReference,
    transferType: "stream"
  ): Promise<Readable>;

  public download(
    reference: ObjectReference,
    transferType: "local",
    localPath?: string
  ): Promise<string>;

  public async download(
    reference: ObjectReference,
    transferType: TransferType,
    localPath?: string
  ): Promise<TransferData> {
    assertRelativeDirectory(reference.relativeDirectory);
    const downloadStream = await this._s3Client.download(reference);
    return streamToTransferType(downloadStream, transferType, localPath);
  }

  public async upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Metadata,
    headers?: ContentHeaders
  ): Promise<void> {
    assertRelativeDirectory(reference.relativeDirectory);
    let dataToUpload: Readable | Buffer;
    if (typeof data === "string") {
      await assertFileNotEmpty(data);
      dataToUpload = createReadStream(data);
    } else {
      dataToUpload = data;
    }
    return this._s3Client.upload(reference, dataToUpload, metadata, headers);
  }

  public async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions,
    headers?: ContentHeaders
  ): Promise<void> {
    assertRelativeDirectory(reference.relativeDirectory);
    let dataToUpload: Buffer | Readable;
    if (typeof data === "string") {
      await assertFileNotEmpty(data);
      dataToUpload = createReadStream(data);
    } else {
      dataToUpload = data;
    }
    return this._s3Client.uploadInMultipleParts(
      reference,
      dataToUpload,
      options,
      headers
    );
  }

  public async createBaseDirectory(directory: BaseDirectory): Promise<void> {
    return this._s3Client.upload({
      baseDirectory: directory.baseDirectory,
      objectName: "",
    });
  }

  public getListDirectoriesPagedIterator(
    maxPageSize = 1000
  ): EntityPageListIterator<BaseDirectory> {
    const pageIterator: EntityPageListIterator<BaseDirectory> =
      new EntityPageListIterator(() =>
        this._s3Client.getDirectoriesNextPage({ maxPageSize: maxPageSize })
      );
    return pageIterator;
  }

  public getListObjectsPagedIterator(
    directory: BaseDirectory,
    maxPageSize = 1000
  ): EntityPageListIterator<ObjectReference> {
    const pageIterator: EntityPageListIterator<ObjectReference> =
      new EntityPageListIterator(() =>
        this._s3Client.getObjectsNextPage(directory, {
          maxPageSize: maxPageSize,
        })
      );
    return pageIterator;
  }

  /** Max 1000 objects
   * @deprecated Use listObjects method instead.
   */
  // eslint-disable-next-line deprecation/deprecation
  public async list(directory: BaseDirectory): Promise<ObjectReference[]> {
    return this.listObjects(directory);
  }

  public async deleteBaseDirectory(directory: BaseDirectory): Promise<void> {
    const options = { maxPageSize: 1000, includeEmptyFiles: true };
    const pageIterator: EntityPageListIterator<ObjectReference> =
      new EntityPageListIterator(() =>
        this._s3Client.getObjectsNextPage(directory, options)
      );
    await Promise.all(
      (
        await this.listAllEntriesFromIterator(pageIterator)
      ).map(async (file) => this._s3Client.deleteObject(file))
    );
  }

  public async deleteObject(reference: ObjectReference): Promise<void> {
    assertRelativeDirectory(reference.relativeDirectory);

    await this._s3Client.deleteObject(reference);
  }

  public async baseDirectoryExists(directory: BaseDirectory): Promise<boolean> {
    return this._s3Client.prefixExists(directory);
  }

  public async objectExists(reference: ObjectReference): Promise<boolean> {
    assertRelativeDirectory(reference.relativeDirectory);

    return this._s3Client.objectExists(reference);
  }

  public async updateMetadata(
    reference: ObjectReference,
    metadata: Metadata
  ): Promise<void> {
    assertRelativeDirectory(reference.relativeDirectory);

    return this._s3Client.updateMetadata(reference, metadata);
  }

  public async getObjectProperties(
    reference: ObjectReference
  ): Promise<ObjectProperties> {
    assertRelativeDirectory(reference.relativeDirectory);

    return this._s3Client.getObjectProperties(reference);
  }

  public async getDownloadUrl(
    reference: ObjectReference,
    options?: ExpiryOptions
  ): Promise<string> {
    assertRelativeDirectory(reference.relativeDirectory);

    return this._presignedUrlProvider.getDownloadUrl(reference, options);
  }

  public async getUploadUrl(
    reference: ObjectReference,
    options?: ExpiryOptions
  ): Promise<string> {
    assertRelativeDirectory(reference.relativeDirectory);

    return this._presignedUrlProvider.getUploadUrl(reference, options);
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    options?: ExpiryOptions
  ): Promise<TransferConfig> {
    assertRelativeDirectory(directory.relativeDirectory);

    return this._transferConfigProvider.getDownloadConfig(directory, options);
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    options?: ExpiryOptions
  ): Promise<TransferConfig> {
    assertRelativeDirectory(directory.relativeDirectory);

    return this._transferConfigProvider.getUploadConfig(directory, options);
  }

  /**
   * Copying from a different region is only available on AWS.
   */
  public copyObject(
    sourceStorage: ServerStorage,
    sourceReference: ObjectReference,
    targetReference: ObjectReference
  ): Promise<void> {
    assertRelativeDirectory(sourceReference.relativeDirectory);
    assertRelativeDirectory(targetReference.relativeDirectory);

    if (!(sourceStorage instanceof S3ServerStorage)) {
      throw new Error(
        `Source storage must be an instance of ${S3ServerStorage.name} to use ${S3ServerStorage.prototype.copyObject.name} method.`
      );
    }

    return this._s3Client.copyObject(
      sourceStorage.bucketName,
      sourceReference,
      targetReference
    );
  }

  public get bucketName(): string {
    return this._s3Client.bucketName;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getDirectoryAccessConfig(
    directory: ObjectDirectory,
    options?: ExpiryOptions
  ): Promise<TransferConfig> {
    assertRelativeDirectory(directory.relativeDirectory);

    return this._transferConfigProvider.getDirectoryAccessConfig(
      directory,
      options
    );
  }

  public releaseResources(): void {
    this._s3Client.releaseResources();
  }
}
