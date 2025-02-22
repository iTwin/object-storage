/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import { RestError } from "@azure/storage-blob";

import { assertRelativeDirectory } from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  assertLocalFile,
  getExpiryDate,
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

import { AzureTransferConfig, Constants } from "../common";
import { buildBlobName } from "../common/internal";

import {
  buildBlobSASParameters,
  buildContainerSASParameters,
} from "./internal";
import { BlobServiceClientWrapper, BlockBlobClientWrapper } from "./wrappers";

export interface AzureServerStorageConfig {
  accountName: string;
  accountKey: string;
  baseUrl: string;
}

export class AzureServerStorage extends ServerStorage {
  private readonly _config: AzureServerStorageConfig;
  private readonly _client: BlobServiceClientWrapper;

  public constructor(
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
    maxPageSize = 1000
  ): EntityPageListIterator<ObjectReference> {
    const pageIterator: EntityPageListIterator<ObjectReference> =
      new EntityPageListIterator(() =>
        this._client.getObjectsNextPage(directory, { maxPageSize: maxPageSize })
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
    const parameters = buildBlobSASParameters(
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
    const parameters = buildBlobSASParameters(
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
    const parameters = buildBlobSASParameters(
      directory.baseDirectory,
      "read",
      expiresOn,
      this._config.accountName,
      this._config.accountKey
    );

    return {
      storageType: Constants.storageType,
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
    const parameters = buildBlobSASParameters(
      directory.baseDirectory,
      "write",
      expiresOn,
      this._config.accountName,
      this._config.accountKey
    );

    return {
      storageType: Constants.storageType,
      authentication: parameters,
      expiration: expiresOn,
      baseUrl: this._config.baseUrl,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getDirectoryAccessConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<AzureTransferConfig> {
    assertRelativeDirectory(directory.relativeDirectory);

    const expiresOn = getExpiryDate(expiry);
    const parameters = buildContainerSASParameters(
      directory.baseDirectory,
      expiresOn,
      this._config.accountName,
      this._config.accountKey
    );

    return {
      storageType: Constants.storageType,
      authentication: parameters,
      expiration: expiresOn,
      baseUrl: this._config.baseUrl,
    };
  }

  public async copyObject(
    sourceStorage: ServerStorage,
    sourceReference: ObjectReference,
    targetReference: ObjectReference
  ): Promise<void> {
    assertRelativeDirectory(sourceReference.relativeDirectory);
    assertRelativeDirectory(targetReference.relativeDirectory);

    if (!(sourceStorage instanceof AzureServerStorage)) {
      throw new Error(
        `Source storage must be an instance of ${AzureServerStorage.name} to use ${AzureServerStorage.prototype.copyObject.name} method.`
      );
    }

    const sourceUrl = await sourceStorage.getDownloadUrl(sourceReference);
    const targetBlobClient = this._client.getBlobClient(targetReference);

    const copyPoller = await targetBlobClient.beginCopyFromURL(sourceUrl);
    await copyPoller.pollUntilDone();
  }

  public override async releaseResources(): Promise<void> {}

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
