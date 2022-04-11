/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import { RestError } from "@azure/storage-blob";
import { inject, injectable } from "inversify";

import {
  assertFileNotEmpty,
  assertLocalFile,
  BaseDirectory,
  buildObjectKey,
  buildObjectReference,
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectDirectory,
  ObjectProperties,
  ObjectReference,
  ServerStorage,
  streamToTransferType,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { buildSASParameters } from "./BackendHelpers";
import { BlobServiceClientWrapper } from "./BlobServiceClientWrapper";
import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";
import { buildBlobName, buildExpiresOn } from "./Helpers";
import { AzureTransferConfig } from "./Interfaces";
import { Types } from "./Types";

export interface AzureServerStorageConfig {
  accountName: string;
  accountKey: string;
  baseUrl: string;
}

@injectable()
export class AzureServerStorage extends ServerStorage {
  private readonly _config: AzureServerStorageConfig;
  private readonly _client: BlobServiceClientWrapper;

  public constructor(
    @inject(Types.Server.config)
    config: AzureServerStorageConfig,
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
    if (transferType === "local") {
      assertLocalFile(localPath);
      await promises.mkdir(dirname(localPath), { recursive: true });
    }

    const downloadStream = await new BlockBlobClientWrapper(
      this._client.getBlockBlobClient(reference)
    ).download();

    return streamToTransferType(downloadStream, transferType, localPath);
  }

  public async upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Metadata
  ): Promise<void> {
    await assertFileNotEmpty(data);

    return new BlockBlobClientWrapper(
      this._client.getBlockBlobClient(reference)
    ).upload(data, metadata);
  }

  public async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void> {
    await assertFileNotEmpty(data);

    return new BlockBlobClientWrapper(
      this._client.getBlockBlobClient(reference)
    ).uploadInMultipleParts(data, options);
  }

  public async createBaseDirectory(directory: BaseDirectory): Promise<void> {
    await this._client.getContainerClient(directory.baseDirectory).create();
  }

  public async list(directory: BaseDirectory): Promise<ObjectReference[]> {
    const containerClient = this._client.getContainerClient(
      directory.baseDirectory
    );
    const iter = containerClient.listBlobsFlat();

    const names = Array<string>();
    for await (const item of iter) names.push(item.name);

    const references: (ObjectReference | undefined)[] = names.map((name) =>
      buildObjectReference(
        buildObjectKey({
          ...directory,
          objectName: name,
        })
      )
    );
    const result: ObjectReference[] = references.filter(
      (reference): reference is ObjectReference => reference !== undefined
    );

    return result;
  }

  public async deleteBaseDirectory(directory: BaseDirectory): Promise<void> {
    return this.handleNotFound(async () => {
      await this._client.getContainerClient(directory.baseDirectory).delete();
    });
  }

  public async deleteObject(reference: ObjectReference): Promise<void> {
    return this.handleNotFound(async () => {
      await this._client.getBlobClient(reference).delete();
    });
  }

  public async baseDirectoryExists(directory: BaseDirectory): Promise<boolean> {
    return this._client.getContainerClient(directory.baseDirectory).exists();
  }

  public async objectExists(reference: ObjectReference): Promise<boolean> {
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
  ): Promise<AzureTransferConfig> {
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
  ): Promise<AzureTransferConfig> {
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

  public releaseResources(): void {}

  private async handleNotFound(operation: () => Promise<void>): Promise<void> {
    try {
      await operation();
    } catch (error: unknown) {
      if (error instanceof RestError && error.statusCode === 404) {
        return;
      }
      throw error;
    }
  }
}
