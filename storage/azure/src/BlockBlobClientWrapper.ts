/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import { BlockBlobClient, Metadata } from "@azure/storage-blob";

import {
  MultipartUploadData,
  MultipartUploadOptions,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

export class BlockBlobClientWrapper {
  constructor(private readonly _client: BlockBlobClient) {}

  public async download(
    transferType: TransferType,
    localPath?: string
  ): Promise<TransferData> {
    switch (transferType) {
      case "buffer":
        return this._client.downloadToBuffer();

      case "local":
        if (!localPath) throw new Error("Specify localPath");

        await promises.mkdir(dirname(localPath), { recursive: true });
        await this._client.downloadToFile(localPath);

        return localPath;

      case "stream":
        return (await this._client.download()).readableStreamBody! as Readable;

      default:
        throw new Error(`Type '${transferType}' is not supported`);
    }
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
