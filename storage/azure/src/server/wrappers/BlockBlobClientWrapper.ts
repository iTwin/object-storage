/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { BlobHTTPHeaders, BlockBlobClient, Metadata } from "@azure/storage-blob";

import {
  MultipartUploadData,
  MultipartUploadOptions,
  TransferData,
} from "@itwin/object-storage-core";

export class BlockBlobClientWrapper {
  constructor(private readonly _client: BlockBlobClient) {}

  public async download(): Promise<Readable> {
    const downloadResponse = await this._client.download();
    return downloadResponse.readableStreamBody! as Readable;
  }

  public async upload(data: TransferData, metadata?: Metadata, contentEncoding?: string): Promise<void> {
    const blobHTTPHeaders: BlobHTTPHeaders | undefined = contentEncoding ? { blobContentEncoding: contentEncoding } : undefined;
    if (data instanceof Buffer)
      await this._client.upload(data, data.byteLength, { metadata, blobHTTPHeaders });
    else if (data instanceof Readable)
      await this._client.uploadStream(data, undefined, undefined, { metadata, blobHTTPHeaders });
    else await this._client.uploadFile(data, { metadata, blobHTTPHeaders });
  }

  public async uploadInMultipleParts(
    data: MultipartUploadData,
    options?: MultipartUploadOptions,
    contentEncoding?: string
  ): Promise<void> {
    const blobHTTPHeaders: BlobHTTPHeaders | undefined = contentEncoding ? { blobContentEncoding: contentEncoding } : undefined;
    const { metadata, partSize, queueSize } = options ?? {};
    if (data instanceof Readable)
      await this._client.uploadStream(data, partSize, queueSize, { metadata, blobHTTPHeaders });
    else
      await this._client.uploadFile(data, {
        metadata,
        blockSize: partSize,
        concurrency: queueSize,
        blobHTTPHeaders,
      });
  }
}
