/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Readable } from "stream";

import { inject, injectable } from "inversify";

import {
  buildObjectKey,
  buildObjectReference,
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectDirectory,
  ObjectProperties,
  ObjectReference,
  ServerSideStorage,
  TransferConfig,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { BlobServiceClientWrapper } from "./BlobServiceClientWrapper";
import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";
import { buildBlobName, buildExpiresOn, buildSASParameters } from "./Helpers";
import { Types } from "./Types";

export interface AzureServerSideBlobStorageConfig {
  accountName: string;
  accountKey: string;
  baseUrl: string;
}

@injectable()
export class AzureServerSideBlobStorage extends ServerSideStorage {
  private readonly _config: AzureServerSideBlobStorageConfig;
  private readonly _client: BlobServiceClientWrapper;

  public constructor(
    @inject(Types.ServerSide.config)
    config: AzureServerSideBlobStorageConfig,
    client: BlobServiceClientWrapper
  ) {
    super();

    this._config = config;
    this._client = client;
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
    return new BlockBlobClientWrapper(
      this._client.getBlockBlobClient(reference)
    ).download(transferType, localPath);
  }

  public async upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Metadata
  ): Promise<void> {
    return new BlockBlobClientWrapper(
      this._client.getBlockBlobClient(reference)
    ).upload(data, metadata);
  }

  public async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void> {
    return new BlockBlobClientWrapper(
      this._client.getBlockBlobClient(reference)
    ).uploadInMultipleParts(data, options);
  }

  public async list(directory: ObjectDirectory): Promise<ObjectReference[]> {
    const { baseDirectory, relativeDirectory } = directory;
    const containerClient = this._client.getContainerClient(baseDirectory);

    const iter = containerClient.listBlobsFlat({
      prefix: relativeDirectory,
    });

    const names = Array<string>();
    for await (const item of iter) names.push(item.name);

    return names.map((name) =>
      buildObjectReference(
        buildObjectKey({
          ...directory,
          objectName: name,
        })
      )
    );
  }

  public async remove(reference: ObjectReference): Promise<void> {
    await this._client.getBlobClient(reference).delete();
  }

  public async exists(reference: ObjectReference): Promise<boolean> {
    return this._client.getBlobClient(reference).exists();
  }

  public async updateMetadata(
    reference: ObjectReference,
    metadata: Metadata
  ): Promise<void> {
    await this._client.getBlobClient(reference).setMetadata(metadata);
  }

  public async getObjectProperties(
    reference: ObjectReference
  ): Promise<ObjectProperties> {
    const { lastModified, contentLength, metadata } = await this._client
      .getBlobClient(reference)
      .getProperties();

    return {
      lastModified: lastModified!,
      reference,
      size: contentLength!,
      metadata,
    };
  }

  public async getDownloadUrl(
    reference: ObjectReference,
    expiresInSeconds = 3600
  ): Promise<string> {
    const blobClient = this._client.getBlockBlobClient(reference);
    const parameters = buildSASParameters(
      reference.baseDirectory,
      "read",
      buildExpiresOn(expiresInSeconds),
      this._config.accountName,
      this._config.accountKey,
      buildBlobName(reference)
    );

    return `${blobClient.url}?${parameters}`;
  }

  public async getUploadUrl(
    reference: ObjectReference,
    expiresInSeconds = 3600
  ): Promise<string> {
    const blobClient = this._client.getBlockBlobClient(reference);
    const parameters = buildSASParameters(
      reference.baseDirectory,
      "write",
      buildExpiresOn(expiresInSeconds),
      this._config.accountName,
      this._config.accountKey,
      buildBlobName(reference)
    );

    return `${blobClient.url}?${parameters}`;
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    expiresInSeconds = 3600
  ): Promise<TransferConfig> {
    const expiresOn = buildExpiresOn(expiresInSeconds);
    const parameters = buildSASParameters(
      directory.baseDirectory,
      "read",
      expiresOn,
      this._config.accountName,
      this._config.accountKey
    );

    return {
      authentication: parameters,
      expiration: expiresOn,
      baseUrl: this._config.baseUrl,
    };
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    expiresInSeconds = 3600
  ): Promise<TransferConfig> {
    const expiresOn = buildExpiresOn(expiresInSeconds);
    const parameters = buildSASParameters(
      directory.baseDirectory,
      "write",
      expiresOn,
      this._config.accountName,
      this._config.accountKey
    );

    return {
      authentication: parameters,
      expiration: expiresOn,
      baseUrl: this._config.baseUrl,
    };
  }

  public async createBaseDirectory(name: string): Promise<void> {
    return this._client.createContainer(name);
  }

  public async deleteBaseDirectory(name: string): Promise<void> {
    return this._client.deleteContainer(name);
  }
}
