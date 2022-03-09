/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { inject, injectable } from "inversify";

import {
  ClientStorage,
  downloadFromUrl,
  instanceOfUrlDownloadInput,
  instanceOfUrlUploadInput,
  metadataToHeaders,
  TransferConfig,
  TransferData,
  uploadToUrl,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import { transferConfigToS3ClientWrapper } from "./Helpers";
import {
  S3ConfigDownloadInput,
  S3ConfigUploadInput,
  S3UploadInMultiplePartsInput,
} from "./Interfaces";
import { Types } from "./Types";

import { S3ClientWrapper } from ".";

export interface S3ClientStorageConfig {
  bucket: string;
}

@injectable()
export class S3ClientStorage extends ClientStorage {
  private readonly _bucket: string;

  public constructor(
    @inject(Types.S3Server.config) config: S3ClientStorageConfig
  ) {
    super();

    this._bucket = config.bucket;
  }

  public download(
    input: (UrlDownloadInput | S3ConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<Buffer>;

  public download(
    input: (UrlDownloadInput | S3ConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<Readable>;

  public download(
    input: (UrlDownloadInput | S3ConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;

  public async download(
    input: UrlDownloadInput | S3ConfigDownloadInput
  ): Promise<TransferData> {
    if (instanceOfUrlDownloadInput(input)) return downloadFromUrl(input);

    const { transferType, localPath, reference, transferConfig } = input;

    return this.useClient(
      transferConfig,
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.download(reference, transferType, localPath)
    );
  }

  public async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    const { data, metadata } = input;

    if (instanceOfUrlUploadInput(input))
      return uploadToUrl(
        input.url,
        data,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );

    return this.useClient(
      input.transferConfig,
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.upload(input.reference, data, metadata)
    );
  }

  public async uploadInMultipleParts(
    input: S3UploadInMultiplePartsInput
  ): Promise<void> {
    return this.useClient(
      input.transferConfig,
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.uploadInMultipleParts(
          input.reference,
          input.data,
          input.options
        )
    );
  }

  private async useClient<T>(
    transferConfig: TransferConfig,
    method: (clientWrapper: S3ClientWrapper) => Promise<T>
  ): Promise<T> {
    const clientWrapper = transferConfigToS3ClientWrapper(
      transferConfig,
      this._bucket
    );

    try {
      return await method(clientWrapper);
    } finally {
      clientWrapper.releaseResources();
    }
  }
}
