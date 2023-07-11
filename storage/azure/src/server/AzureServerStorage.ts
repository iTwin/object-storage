/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import { RestError } from "@azure/storage-blob";
import { inject, injectable } from "inversify";

import { assertRelativeDirectory } from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  assertLocalFile,
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
  EntityPageListIterator,
  ServerStorage,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { AzureTransferConfig, Types } from "../common";
import { buildBlobName, getExpiryDate } from "../common/internal";

import { buildSASParameters } from "./internal";
import { BlobServiceClientWrapper, BlockBlobClientWrapper } from "./wrappers";

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
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    @inject(Types.AzureServer.config) config: AzureServerStorageConfig,
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
    assertRelativeDirectory(reference.relativeDirectory);
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
    metadata?: Metadata,
    headers?: ContentHeaders
  ): Promise<void> {
    assertRelativeDirectory(reference.relativeDirectory);
    if (typeof data === "string") await assertFileNotEmpty(data);

    return new BlockBlobClientWrapper(
      this._client.getBlockBlobClient(reference)
    ).upload(data, metadata, headers);
  }

  public async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions,
    headers?: ContentHeaders
  ): Promise<void> {
    assertRelativeDirectory(reference.relativeDirectory);
    if (typeof data === "string") await assertFileNotEmpty(data);

    return new BlockBlobClientWrapper(
      this._client.getBlockBlobClient(reference)
    ).uploadInMultipleParts(data, options, headers);
  }

  public async createBaseDirectory(directory: BaseDirectory): Promise<void> {
    await this._client.getContainerClient(directory.baseDirectory).create();
  }

  public getListDirectoriesPagedIterator(
    maxPageSize = 1000
  ): EntityPageListIterator<BaseDirectory> {
    const pageIterator: EntityPageListIterator<BaseDirectory> =
      new EntityPageListIterator(() =>
        this._client.getDirectoriesNextPage({ maxPageSize: maxPageSize })
      );
    return pageIterator;
  }

  public getListObjectsPagedIterator(
    directory: BaseDirectory,
    options: {
      maxPageSize: 1000;
      includeEmptyFiles?: boolean;
    }
  ): EntityPageListIterator<ObjectReference> {
    const pageIterator: EntityPageListIterator<ObjectReference> =
      new EntityPageListIterator(() =>
        this._client.getObjectsNextPage(directory, {
          maxPageSize: options.maxPageSize,
        })
      );
    return pageIterator;
  }

  /**
   * @deprecated Use listObjects method instead.
   */
  // eslint-disable-next-line deprecation/deprecation
  public async list(directory: BaseDirectory): Promise<ObjectReference[]> {
    return this.listObjects(directory);
  }

  public async deleteBaseDirectory(directory: BaseDirectory): Promise<void> {
    return this.handleNotFound(async () => {
      await this._client.getContainerClient(directory.baseDirectory).delete();
    });
  }

  public async deleteObject(reference: ObjectReference): Promise<void> {
    assertRelativeDirectory(reference.relativeDirectory);

    return this.handleNotFound(async () => {
      await this._client.getBlobClient(reference).delete();
    });
  }

  public async baseDirectoryExists(directory: BaseDirectory): Promise<boolean> {
    return this._client.getContainerClient(directory.baseDirectory).exists();
  }

  public async objectExists(reference: ObjectReference): Promise<boolean> {
    assertRelativeDirectory(reference.relativeDirectory);

    return this._client.getBlobClient(reference).exists();
  }

  public async updateMetadata(
    reference: ObjectReference,
    metadata: Metadata
  ): Promise<void> {
    assertRelativeDirectory(reference.relativeDirectory);

    await this._client.getBlobClient(reference).setMetadata(metadata);
  }

  public async getObjectProperties(
    reference: ObjectReference
  ): Promise<ObjectProperties> {
    assertRelativeDirectory(reference.relativeDirectory);

    const { lastModified, contentLength, metadata, _response } =
      await this._client.getBlobClient(reference).getProperties();

    return {
      lastModified: lastModified!,
      reference,
      size: contentLength!,
      metadata,
      contentEncoding: _response.parsedHeaders.contentEncoding,
      contentType: _response.parsedHeaders.contentType,
      cacheControl: _response.parsedHeaders.cacheControl,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getDownloadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    assertRelativeDirectory(reference.relativeDirectory);

    const blobClient = this._client.getBlockBlobClient(reference);
    const parameters = buildSASParameters(
      reference.baseDirectory,
      "read",
      getExpiryDate(expiry),
      this._config.accountName,
      this._config.accountKey,
      buildBlobName(reference)
    );

    return `${blobClient.url}?${parameters}`;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getUploadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    assertRelativeDirectory(reference.relativeDirectory);

    const blobClient = this._client.getBlockBlobClient(reference);
    const parameters = buildSASParameters(
      reference.baseDirectory,
      "write",
      getExpiryDate(expiry),
      this._config.accountName,
      this._config.accountKey,
      buildBlobName(reference)
    );

    return `${blobClient.url}?${parameters}`;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getDownloadConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<AzureTransferConfig> {
    assertRelativeDirectory(directory.relativeDirectory);

    const expiresOn = getExpiryDate(expiry);
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

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getUploadConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<AzureTransferConfig> {
    assertRelativeDirectory(directory.relativeDirectory);

    const expiresOn = getExpiryDate(expiry);
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
