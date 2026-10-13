/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import {
  RestError,
  StorageSharedKeyCredential,
  UserDelegationKey,
} from "@azure/storage-blob";

import {
  assertBaseDirectory,
  assertObjectReference,
  assertRelativeDirectory,
} from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  assertLocalFile,
  getExpiryDate,
  streamToTransferType,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  BaseDirectory,
  ContentHeaders,
  CopyObjectOptions,
  ExpiryOptions,
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectDirectory,
  ObjectProperties,
  ObjectReference,
  EntityPageListIterator,
  ServerStorage,
  StorageOptions,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { AzureTransferConfig, Constants } from "../common";
import { buildBlobName } from "../common/internal";

import {
  buildBlobSASParameters,
  buildContainerSASParameters,
  isCredentialConfig,
} from "./internal";
import {
  AzureBlobServiceCredentialConfig,
  BlobServiceClientWrapper,
  BlockBlobClientWrapper,
} from "./wrappers";

export interface AzureServerStorageConfig extends StorageOptions {
  accountName: string;
  accountKey: string;
  baseUrl: string;
}

/**
 * Signs SAS URLs and configs with user delegation keys requested through the
 * client. The client must be authenticated with the same token credential.
 * SAS expiry must not exceed the user delegation key's expiry, which is
 * about 7 days minus 5 minutes from now.
 */
export interface AzureServerStorageCredentialConfig
  extends StorageOptions,
    AzureBlobServiceCredentialConfig {}

export class AzureServerStorage extends ServerStorage {
  private readonly _config:
    | AzureServerStorageConfig
    | AzureServerStorageCredentialConfig;
  private readonly _client: BlobServiceClientWrapper;
  private _delegationKey?: { expiresOn: Date; key: Promise<UserDelegationKey> };

  public constructor(
    config: AzureServerStorageConfig | AzureServerStorageCredentialConfig,
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
    assertObjectReference(reference);
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
    assertObjectReference(reference);
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
    assertObjectReference(reference);
    if (typeof data === "string") await assertFileNotEmpty(data);

    return new BlockBlobClientWrapper(
      this._client.getBlockBlobClient(reference)
    ).uploadInMultipleParts(data, options, headers);
  }

  public async createBaseDirectory(directory: BaseDirectory): Promise<void> {
    assertBaseDirectory(directory.baseDirectory);
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
    assertBaseDirectory(directory.baseDirectory);
    const pageIterator: EntityPageListIterator<ObjectReference> =
      new EntityPageListIterator(() =>
        this._client.getObjectsNextPage(directory, {
          maxPageSize: maxPageSize,
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
    assertBaseDirectory(directory.baseDirectory);
    return this.handleNotFound(async () => {
      await this._client.getContainerClient(directory.baseDirectory).delete();
    });
  }

  public async deleteObject(reference: ObjectReference): Promise<void> {
    assertObjectReference(reference);

    return this.handleNotFound(async () => {
      await this._client.getBlobClient(reference).delete();
    });
  }

  public async baseDirectoryExists(directory: BaseDirectory): Promise<boolean> {
    assertBaseDirectory(directory.baseDirectory);
    return this._client.getContainerClient(directory.baseDirectory).exists();
  }

  public async objectExists(reference: ObjectReference): Promise<boolean> {
    assertObjectReference(reference);

    return this._client.getBlobClient(reference).exists();
  }

  public async updateMetadata(
    reference: ObjectReference,
    metadata: Metadata
  ): Promise<void> {
    assertObjectReference(reference);

    await this._client.getBlobClient(reference).setMetadata(metadata);
  }

  public async getObjectProperties(
    reference: ObjectReference
  ): Promise<ObjectProperties> {
    assertObjectReference(reference);

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

  public async getDownloadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    assertObjectReference(reference);

    const blobClient = this._client.getBlockBlobClient(reference);
    const expiresOn = getExpiryDate(expiry);
    const parameters = buildBlobSASParameters(
      reference.baseDirectory,
      "read",
      expiresOn,
      this._config.accountName,
      await this.getSigningKey(expiresOn),
      buildBlobName(reference)
    );

    return `${blobClient.url}?${parameters}`;
  }

  public async getUploadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    assertObjectReference(reference);

    const blobClient = this._client.getBlockBlobClient(reference);
    const expiresOn = getExpiryDate(expiry);
    const parameters = buildBlobSASParameters(
      reference.baseDirectory,
      "write",
      expiresOn,
      this._config.accountName,
      await this.getSigningKey(expiresOn),
      buildBlobName(reference)
    );

    return `${blobClient.url}?${parameters}`;
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<AzureTransferConfig> {
    assertBaseDirectory(directory.baseDirectory);
    assertRelativeDirectory(directory.relativeDirectory);

    const expiresOn = getExpiryDate(expiry);
    const parameters = buildBlobSASParameters(
      directory.baseDirectory,
      "read",
      expiresOn,
      this._config.accountName,
      await this.getSigningKey(expiresOn)
    );

    return {
      storageType: Constants.storageType,
      authentication: parameters,
      expiration: expiresOn,
      baseUrl: this._config.baseUrl,
    };
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<AzureTransferConfig> {
    assertBaseDirectory(directory.baseDirectory);
    assertRelativeDirectory(directory.relativeDirectory);

    const expiresOn = getExpiryDate(expiry);
    const parameters = buildBlobSASParameters(
      directory.baseDirectory,
      "write",
      expiresOn,
      this._config.accountName,
      await this.getSigningKey(expiresOn)
    );

    return {
      storageType: Constants.storageType,
      authentication: parameters,
      expiration: expiresOn,
      baseUrl: this._config.baseUrl,
    };
  }

  public async getDirectoryAccessConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<AzureTransferConfig> {
    assertBaseDirectory(directory.baseDirectory);
    assertRelativeDirectory(directory.relativeDirectory);

    const expiresOn = getExpiryDate(expiry);
    const parameters = buildContainerSASParameters(
      directory.baseDirectory,
      expiresOn,
      this._config.accountName,
      await this.getSigningKey(expiresOn)
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
    targetReference: ObjectReference,
    options?: CopyObjectOptions
  ): Promise<void> {
    assertObjectReference(sourceReference);
    assertObjectReference(targetReference);

    if (!(sourceStorage instanceof AzureServerStorage)) {
      throw new Error(
        `Source storage must be an instance of ${AzureServerStorage.name} to use ${AzureServerStorage.prototype.copyObject.name} method.`
      );
    }

    const sourceUrl = await sourceStorage.getDownloadUrl(
      sourceReference,
      options?.expiry
    );
    const targetBlobClient = this._client.getBlobClient(targetReference);

    const copyPoller = await targetBlobClient.beginCopyFromURL(sourceUrl);
    await copyPoller.pollUntilDone();
  }

  public override async releaseResources(): Promise<void> {}

  /**
   * Shared key config: a new shared key credential, as before.
   * Token credential config: a user delegation key valid until `expiresOn`.
   * Concurrent callers share one key request; a failed request is not cached.
   */
  private async getSigningKey(
    expiresOn: Date
  ): Promise<StorageSharedKeyCredential | UserDelegationKey> {
    if (!isCredentialConfig(this._config))
      return new StorageSharedKeyCredential(
        this._config.accountName,
        this._config.accountKey
      );

    let cached = this._delegationKey;
    if (!cached || cached.expiresOn.getTime() < expiresOn.getTime()) {
      // Whole seconds, because the SDK truncates key dates to seconds.
      // Started 5 minutes ago to tolerate clock skew with Azure.
      const startsOn = new Date(
        Math.floor(Date.now() / 1000) * 1000 - 5 * 60 * 1000
      );
      const keyExpiresOn = new Date(
        startsOn.getTime() + 7 * 24 * 60 * 60 * 1000
      );
      if (expiresOn.getTime() > keyExpiresOn.getTime())
        throw new Error(
          `SAS expiry ${expiresOn.toISOString()} is later than ${keyExpiresOn.toISOString()}. SAS expiry must not exceed the user delegation key's expiry (about 7 days minus 5 minutes from now) when using a token credential.`
        );

      const key = this._client.getUserDelegationKey(startsOn, keyExpiresOn);
      cached = { expiresOn: keyExpiresOn, key };
      this._delegationKey = cached;
      key.catch(() => {
        if (this._delegationKey?.key === key) this._delegationKey = undefined;
      });
    }
    return cached.key;
  }

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
