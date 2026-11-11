/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import {
  BlobDownloadOptions,
  BlobHTTPHeaders,
  BlockBlobClient,
  Metadata,
} from "@azure/storage-blob";

import {
  createUploadProgressHandler,
  getUploadSize,
  throwIfAborted,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  ContentHeaders,
  MultipartUploadData,
  MultipartUploadOptions,
  TransferData,
  TransferProgressCallback,
} from "@itwin/object-storage-core";

export class BlockBlobClientWrapper {
  constructor(private readonly _client: BlockBlobClient) {}

  private getBlobHTTPHeaders(
    headers?: ContentHeaders
  ): BlobHTTPHeaders | undefined {
    return headers === undefined
      ? undefined
      : {
          blobContentEncoding: headers.contentEncoding,
          blobCacheControl: headers.cacheControl,
          blobContentType: headers.contentType,
        };
  }

  public async download(options?: BlobDownloadOptions): Promise<Readable> {
    const downloadResponse = await this._client.download(
      undefined,
      undefined,
      options
    );
    return downloadResponse.readableStreamBody! as Readable;
  }

  public async upload(
    data: TransferData,
    metadata?: Metadata,
    headers?: ContentHeaders,
    transferOptions?: {
      abortSignal?: AbortSignal;
      onProgress?: TransferProgressCallback;
    }
  ): Promise<void> {
    const { abortSignal, onProgress } = transferOptions ?? {};
    const progress = createUploadProgressHandler(
      onProgress,
      onProgress ? await getUploadSize(data) : undefined
    );

    const uploadOptions = {
      metadata,
      blobHTTPHeaders: this.getBlobHTTPHeaders(headers),
      abortSignal,
      onProgress:
        progress &&
        ((event: { loadedBytes: number }) => progress(event.loadedBytes)),
    };
    // For streams, cancellation may not stop per-block uploads, because the
    // SDK does not pass `abortSignal` to them (Azure SDK bug, see
    // https://github.com/Azure/azure-sdk-for-js/issues/32028).
    if (typeof data === "string")
      await this._client.uploadFile(data, uploadOptions);
    else if (data instanceof Readable) {
      throwIfAborted(abortSignal);
      await this._client.uploadStream(
        data,
        undefined,
        undefined,
        uploadOptions
      );
    } else await this._client.upload(data, data.byteLength, uploadOptions);
  }

  public async uploadInMultipleParts(
    data: MultipartUploadData,
    options?: MultipartUploadOptions,
    headers?: ContentHeaders,
    transferOptions?: {
      abortSignal?: AbortSignal;
      onProgress?: TransferProgressCallback;
    }
  ): Promise<void> {
    const { abortSignal, onProgress } = transferOptions ?? {};
    const progress = createUploadProgressHandler(
      onProgress,
      onProgress ? await getUploadSize(data) : undefined
    );

    const { metadata, partSize, queueSize } = options ?? {};
    const uploadOptions = {
      metadata,
      blobHTTPHeaders: this.getBlobHTTPHeaders(headers),
      abortSignal,
      onProgress:
        progress &&
        ((event: { loadedBytes: number }) => progress(event.loadedBytes)),
    };
    // See the comment about stream cancellation in `upload`.
    if (data instanceof Readable) {
      throwIfAborted(abortSignal);
      await this._client.uploadStream(data, partSize, queueSize, uploadOptions);
    } else
      await this._client.uploadFile(data, {
        ...uploadOptions,
        blockSize: partSize,
        concurrency: queueSize,
      });
  }
}
