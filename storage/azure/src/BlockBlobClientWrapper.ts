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
  TransferType,
} from "@itwin/object-storage-core";

export class FrontendBlockBlobClientWrapper {
  constructor(protected readonly _client: BlockBlobClient) {}

  public async download(
    transferType: TransferType,
    _localPath?: string
  ): Promise<TransferData> {
    switch (transferType) {
      case "buffer":
        return this._client.downloadToBuffer();

      case "stream":
        return (await this._client.download()).readableStreamBody! as Readable;

      default:
        throw new Error(`Type '${transferType}' is not supported`);
    }
  }

  public async upload(data: TransferData, metadata?: Metadata): Promise<void> {
    if (typeof data === "string") {
      throw new Error(`File uploads are not supported`);
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
      throw new Error(`File uploads are not supported`);
    } else {
      await this._client.uploadStream(data, partSize, queueSize, {
        metadata,
      });
    }
  }
}
