/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import {
  BlobDownloadOptions,
  BlockBlobClient,
  Metadata,
} from "@azure/storage-blob";

import {
  MultipartUploadData,
  MultipartUploadOptions,
  TransferData,
} from "@itwin/object-storage-core";

export class BlockBlobClientWrapper {
  constructor(private readonly _client: BlockBlobClient) {}

  public async download(options?: BlobDownloadOptions): Promise<Readable> {
    const downloadResponse = await this._client.download(
      undefined,
      undefined,
      options
    );
    return downloadResponse.readableStreamBody! as Readable;
  }

  public async upload(data: TransferData, metadata?: Metadata): Promise<void> {
    if (data instanceof Buffer)
      await this._client.upload(data, data.byteLength, { metadata });
    else if (data instanceof Readable)
      await this._client.uploadStream(data, undefined, undefined, { metadata });
    else await this._client.uploadFile(data, { metadata });
  }

  public async uploadInMultipleParts(
    data: MultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void> {
    const { metadata, partSize, queueSize } = options ?? {};
    if (data instanceof Readable)
      await this._client.uploadStream(data, partSize, queueSize, { metadata });
    else
      await this._client.uploadFile(data, {
        metadata,
        blockSize: partSize,
        concurrency: queueSize,
      });
  }
}
