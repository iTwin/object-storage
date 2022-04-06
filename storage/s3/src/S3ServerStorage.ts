/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { inject, injectable } from "inversify";

import {
  BaseDirectory,
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
  Types,
} from "@itwin/object-storage-core";

import { S3ClientWrapper } from "./S3ClientWrapper";

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
    @inject(Types.Server.presignedUrlProvider)
    presignedUrlProvider: PresignedUrlProvider,
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
    return this._s3Client.download(reference, transferType, localPath);
  }

  public async upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Metadata
  ): Promise<void> {
    return this._s3Client.upload(reference, data, metadata);
  }

  public async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void> {
    return this._s3Client.uploadInMultipleParts(reference, data, options);
  }

  public async createBaseDirectory(directory: BaseDirectory): Promise<void> {
    return this.upload(
      {
        baseDirectory: directory.baseDirectory,
        objectName: "",
      },
      Buffer.from("")
    );
  }

  /** Max 1000 objects */
  public async list(directory: BaseDirectory): Promise<ObjectReference[]> {
    return this._s3Client.list(directory);
  }

  public async deleteBaseDirectory(directory: BaseDirectory): Promise<void> {
    await Promise.all(
      (
        await this.list(directory)
      ).map(async (file) => this._s3Client.deleteObject(file))
    );
  }

  public async deleteObject(reference: ObjectReference): Promise<void> {
    await this._s3Client.deleteObject(reference);
  }

  public async baseDirectoryExists(directory: BaseDirectory): Promise<boolean> {
    return this._s3Client.prefixExists(directory);
  }

  public async objectExists(reference: ObjectReference): Promise<boolean> {
    return this._s3Client.objectExists(reference);
  }

  public async updateMetadata(
    reference: ObjectReference,
    metadata: Metadata
  ): Promise<void> {
    return this._s3Client.updateMetadata(reference, metadata);
  }

  public async getObjectProperties(
    reference: ObjectReference
  ): Promise<ObjectProperties> {
    return this._s3Client.getObjectProperties(reference);
  }

  public async getDownloadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string> {
    return this._presignedUrlProvider.getDownloadUrl(
      reference,
      expiresInSeconds ? Math.floor(expiresInSeconds) : undefined
    );
  }

  public async getUploadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string> {
    return this._presignedUrlProvider.getUploadUrl(
      reference,
      expiresInSeconds ? Math.floor(expiresInSeconds) : undefined
    );
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
  ): Promise<TransferConfig> {
    return this._transferConfigProvider.getDownloadConfig(
      directory,
      expiresInSeconds ? Math.floor(expiresInSeconds) : undefined
    );
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
  ): Promise<TransferConfig> {
    return this._transferConfigProvider.getUploadConfig(
      directory,
      expiresInSeconds ? Math.floor(expiresInSeconds) : undefined
    );
  }

  public releaseResources(): void {
    this._s3Client.releaseResources();
  }
}
