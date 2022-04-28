/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { BlockBlobClient, Metadata } from "@azure/storage-blob";

import {
  FrontendMultipartUploadData,
  FrontendTransferData,
  MultipartUploadOptions,
} from "@itwin/object-storage-core/lib/frontend";

export class BlockBlobClientWrapper {
  constructor(private readonly _client: BlockBlobClient) {}

  public async download(): Promise<Readable> {
    // TODO: update behavior as per documentation
    const downloadResponse = await this._client.download();
    return downloadResponse.readableStreamBody! as Readable;
  }

  public async upload(
    data: FrontendTransferData,
    metadata?: Metadata
  ): Promise<void> {
    if (data instanceof Buffer) {
      // TODO: update behavior as per documentation
      await this._client.upload(data, data.byteLength, { metadata });
    } else {
      await this._client.uploadStream(data, undefined, undefined, { metadata });
    }
  }

  public async uploadInMultipleParts(
    data: FrontendMultipartUploadData,
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
