/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";

import {
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectDirectory,
  ObjectProperties,
  ObjectReference,
  PresignedUrlProvider,
  ServerSideStorage,
  TransferConfig,
  TransferConfigProvider,
  TransferData,
  TransferType,
  Types,
} from "@itwin/object-storage-core";

import { S3ClientWrapper } from "./S3ClientWrapper";

export interface S3ServerSideStorageConfig {
  baseUrl: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  roleArn: string;
  stsBaseUrl: string;
}

@injectable()
export class S3ServerSideStorage extends ServerSideStorage {
  private readonly _s3Client: S3ClientWrapper;
  private readonly _presignedUrlProvider: PresignedUrlProvider;
  private readonly _transferConfigProvider: TransferConfigProvider;

  public constructor(
    s3Client: S3ClientWrapper,
    @inject(Types.ServerSide.presignedUrlProvider)
    presignedUrlProvider: PresignedUrlProvider,
    @inject(Types.ServerSide.transferConfigProvider)
    transferConfigProvider: TransferConfigProvider
  ) {
    super();

    this._s3Client = s3Client;
    this._presignedUrlProvider = presignedUrlProvider;
    this._transferConfigProvider = transferConfigProvider;
  }

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

  /** Max 1000 objects */
  public async list(directory: ObjectDirectory): Promise<ObjectReference[]> {
    return this._s3Client.list(directory);
  }

  public async remove(reference: ObjectReference): Promise<void> {
    return this._s3Client.remove(reference);
  }

  public async exists(reference: ObjectReference): Promise<boolean> {
    return this._s3Client.exists(reference);
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
      expiresInSeconds
    );
  }

  public async getUploadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string> {
    return this._presignedUrlProvider.getUploadUrl(reference, expiresInSeconds);
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
  ): Promise<TransferConfig> {
    return this._transferConfigProvider.getDownloadConfig(
      directory,
      expiresInSeconds
    );
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
  ): Promise<TransferConfig> {
    return this._transferConfigProvider.getUploadConfig(
      directory,
      expiresInSeconds
    );
  }

  public async createBaseDirectory(name: string): Promise<void> {
    return this.upload(
      {
        baseDirectory: name,
        objectName: "",
      },
      Buffer.from("")
    );
  }

  public async deleteBaseDirectory(name: string): Promise<void> {
    await Promise.all(
      (
        await this.list({ baseDirectory: name })
      ).map(async (file) => this.remove(file))
    );
  }
}
