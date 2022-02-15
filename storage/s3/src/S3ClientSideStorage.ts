/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Readable } from "stream";

import { inject, injectable } from "inversify";

import {
  ClientSideStorage,
  ConfigDownloadInput,
  ConfigUploadInput,
  downloadFromUrl,
  instanceOfUrlDownloadInput,
  instanceOfUrlUploadInput,
  metadataToHeaders,
  TransferData,
  UploadInMultiplePartsInput,
  uploadToUrl,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import { transferConfigToS3ClientWrapper } from "./Helpers";
import { Types } from "./Types";

export interface S3ClientSideStorageConfig {
  bucket: string;
}

@injectable()
export class S3ClientSideStorage extends ClientSideStorage {
  private readonly _bucket: string;

  public constructor(
    @inject(Types.S3ServerSide.config) config: S3ClientSideStorageConfig
  ) {
    super();

    this._bucket = config.bucket;
  }

  public download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "buffer" }
  ): Promise<Buffer>;

  public download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "stream" }
  ): Promise<Readable>;

  public download(
    input: (UrlDownloadInput | ConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;

  public async download(
    input: UrlDownloadInput | ConfigDownloadInput
  ): Promise<TransferData> {
    if (instanceOfUrlDownloadInput(input)) return downloadFromUrl(input);

    const { transferType, localPath, reference, transferConfig } = input;

    return transferConfigToS3ClientWrapper(
      transferConfig,
      this._bucket
    ).download(reference, transferType, localPath);
  }

  public async upload(
    input: UrlUploadInput | ConfigUploadInput
  ): Promise<void> {
    const { data, metadata } = input;

    if (instanceOfUrlUploadInput(input))
      return uploadToUrl(
        input.url,
        data,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );

    return transferConfigToS3ClientWrapper(
      input.transferConfig,
      this._bucket
    ).upload(input.reference, data, metadata);
  }

  public async uploadInMultipleParts(
    input: UploadInMultiplePartsInput
  ): Promise<void> {
    return transferConfigToS3ClientWrapper(
      input.transferConfig,
      this._bucket
    ).uploadInMultipleParts(input.reference, input.data, input.options);
  }
}
