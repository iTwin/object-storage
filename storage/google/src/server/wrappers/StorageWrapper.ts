/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Readable } from "stream";

import {
  ApiError,
  Bucket,
  File,
  SaveOptions,
  Storage,
  UploadOptions,
} from "@google-cloud/storage";

import { buildObjectKey } from "@itwin/object-storage-core/lib/common/internal";
import {
  getExpiryDate,
  streamToBuffer,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  BaseDirectory,
  ContentHeaders,
  EntityCollectionPage,
  ExpiryOptions,
  Metadata,
  ObjectProperties,
  ObjectReference,
  TransferData,
} from "@itwin/object-storage-core";

import { GoogleStorageConfig } from "./GoogleStorageConfig";

export class StorageWrapper {
  constructor(
    private readonly _storage: Storage,
    private readonly _config: Pick<GoogleStorageConfig, "bucketName">
  ) {}

  public async downloadFile(
    reference: ObjectReference,
    destination?: string
  ): Promise<Buffer> {
    const [buffer] = await this.fileObject(reference).download({
      destination,
    });
    return buffer;
  }

  public async uploadFile(
    reference: ObjectReference,
    data?: TransferData,
    metadata?: Metadata,
    headers?: ContentHeaders,
    chunkSize?: number
  ): Promise<void> {
    const options: SaveOptions = {
      metadata: { ...metadata },
      chunkSize: chunkSize,
    };
    options.contentType = headers?.contentType;
    options.gzip = headers?.contentEncoding === "gzip";
    if (typeof data === "string") {
      const uploadOptions: UploadOptions = { ...options };
      uploadOptions.destination = buildObjectKey(reference);
      await this.bucketObject().upload(data, uploadOptions);
    } else {
      const saveData: Buffer | string =
        data instanceof Readable ? await streamToBuffer(data) : data ?? "";
      await this.fileObject(reference).save(saveData, options);
    }
    if (metadata || headers?.cacheControl || headers?.contentEncoding) {
      const [updatedMetadata] = await this.fileObject(reference).getMetadata();
      updatedMetadata.metadata = { ...updatedMetadata.metadata, ...metadata };
      if (headers?.cacheControl)
        updatedMetadata.cacheControl = headers.cacheControl;
      if (headers?.contentEncoding)
        updatedMetadata.contentEncoding = headers.contentEncoding;
      await this.fileObject(reference).setMetadata(updatedMetadata);
    }
  }

  public async getFilesNextPage(options: {
    directory: BaseDirectory;
    maxPageSize: number;
    continuationToken?: string;
  }): Promise<EntityCollectionPage<ObjectReference>> {
    const [files, nextPageToken] = await this.bucketObject().getFiles({
      prefix: options.directory.baseDirectory,
      maxResults: options.maxPageSize,
      pageToken: options.continuationToken,
    });
    return {
      entities: files.map((file) => {
        const parts = file.name.split("/");
        const reference: ObjectReference = {
          objectName: parts.length > 1 ? parts[parts.length - 1] : "",
          baseDirectory: parts[0] || options.directory.baseDirectory,
        };
        if (parts.length > 2) {
          reference.relativeDirectory = parts
            .slice(1, parts.length - 1)
            .join("/");
        }
        return reference;
      }),
      next: nextPageToken?.pageToken
        ? () =>
            this.getFilesNextPage({
              ...options,
              continuationToken: nextPageToken.pageToken,
            })
        : undefined,
    };
  }

  public async deleteFile(reference: ObjectReference): Promise<void> {
    try {
      await this.fileObject(reference).delete();
    } catch (error) {
      if (error instanceof ApiError && error.code === 404) return;
      throw error;
    }
  }

  public async copyFile(
    sourceBucket: string,
    sourceReference: ObjectReference,
    destinationReference: ObjectReference
  ): Promise<void> {
    await this._storage
      .bucket(sourceBucket)
      .file(buildObjectKey(sourceReference))
      .copy(this.fileObject(destinationReference));
  }

  public async getSignedUrl(
    action: "read" | "write",
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    const expires = getExpiryDate(expiry);
    const [url] = await this.fileObject(reference).getSignedUrl({
      action,
      expires,
      version: "v4",
    });
    return url;
  }

  public async updateMetadata(
    reference: ObjectReference,
    metadata: Metadata
  ): Promise<void> {
    const [updatedMetadata] = await this.fileObject(reference).getMetadata();
    updatedMetadata.metadata = metadata;
    await this.fileObject(reference).setMetadata(updatedMetadata);
  }

  public async getObjectProperties(
    reference: ObjectReference
  ): Promise<ObjectProperties> {
    const [fileMetadata] = await this.fileObject(reference).getMetadata();
    const metadata: Metadata = {};
    if (fileMetadata.metadata) {
      for (const key of Object.keys(fileMetadata.metadata)) {
        metadata[key] = String(fileMetadata.metadata[key]);
      }
    }
    return {
      reference,
      lastModified: fileMetadata.updated
        ? new Date(fileMetadata.updated)
        : new Date(),
      size: Number(fileMetadata.size),
      metadata: metadata,
      contentType: fileMetadata.contentType,
      contentEncoding: fileMetadata.contentEncoding,
      cacheControl: fileMetadata.cacheControl,
    };
  }

  public async fileExists(reference: ObjectReference): Promise<boolean> {
    try {
      await this.fileObject(reference).get();
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      if (error instanceof ApiError && error.code === 404) return false;
      throw error;
    }
  }

  private bucketObject(): Bucket {
    return this._storage.bucket(this._config.bucketName);
  }

  private fileObject(reference: ObjectReference): File {
    return this.bucketObject().file(buildObjectKey(reference));
  }
}
