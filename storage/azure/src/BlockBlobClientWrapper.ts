/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { BlockBlobClient, Metadata } from "@azure/storage-blob";

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

  public async upload(data: TransferData, metadata?: Metadata): Promise<void> {
    if (typeof data === "string") {
      await this._client.uploadFile(data, { metadata });
    } else if (data instanceof Buffer) {
      await this._client.upload(data, data.byteLength, { metadata });
    } else {
      await this._client.uploadStream(data, undefined, undefined, { metadata });
    }
  }

  public async uploadInMultipleParts(
    data: MultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void> {
    const { metadata, partSize, queueSize } = options ?? {};

    if (typeof data === "string") {
      await this._client.uploadFile(data, {
        metadata,
        blockSize: partSize,
        concurrency: queueSize,
      });
    } else {
      await this._client.uploadStream(data, partSize, queueSize, {
        metadata,
      });
    }
  }
}
