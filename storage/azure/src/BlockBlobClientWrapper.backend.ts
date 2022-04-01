import { promises } from "fs";
import { dirname } from "path";

import { Metadata } from "@azure/storage-blob";

import {
  MultipartUploadData,
  MultipartUploadOptions,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { FrontendBlockBlobClientWrapper } from "./BlockBlobClientWrapper";

export class BlockBlobClientWrapper extends FrontendBlockBlobClientWrapper {
  public override async download(
    transferType: TransferType,
    localPath?: string
  ): Promise<TransferData> {
    if (transferType === "local") {
      if (!localPath) throw new Error("Specify localPath");

      await promises.mkdir(dirname(localPath), { recursive: true });
      await this._client.downloadToFile(localPath);

      return localPath;
    }

    return super.download(transferType, localPath);
  }

  public override async upload(
    data: TransferData,
    metadata?: Metadata
  ): Promise<void> {
    if (typeof data === "string") {
      await this._client.uploadFile(data, { metadata });
    } else return super.upload(data, metadata);
  }

  public override async uploadInMultipleParts(
    data: MultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void> {
    if (typeof data === "string") {
      await this._client.uploadFile(data, {
        metadata: options?.metadata,
        blockSize: options?.partSize,
        concurrency: options?.queueSize,
      });
    } else return super.uploadInMultipleParts(data, options);
  }
}
