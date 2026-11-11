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
  ClientUploadTransferOptions,
  createUploadProgressHandler,
  getUploadSize,
  throwIfAborted,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  ContentHeaders,
  MultipartUploadData,
  MultipartUploadOptions,
  TransferData,
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
    transferOptions?: ClientUploadTransferOptions
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
    if (typeof data === "string")
      await this._client.uploadFile(data, uploadOptions);
    else if (data instanceof Readable) {
      // `uploadStream` passes `abortSignal` only to the final commit request,
      // not to the block uploads, so a cancelled stream upload still sends
      // every block before it rejects. The signal is checked first so that
      // nothing is sent if it is already aborted.
      throwIfAborted(abortSignal);
      await this._client.uploadStream(
        data,
        undefined,
        undefined,
        uploadOptions
      );
    } else {
      // For a `Buffer` the SDK calls `onProgress` only once, with the full
      // size, before the data is sent. It reports progress per chunk only for
      // streams (https://github.com/Azure/azure-sdk-for-js/issues/27322).
      await this._client.upload(data, data.byteLength, uploadOptions);
    }
  }

  public async uploadInMultipleParts(
    data: MultipartUploadData,
    options?: MultipartUploadOptions,
    headers?: ContentHeaders,
    transferOptions?: ClientUploadTransferOptions
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
