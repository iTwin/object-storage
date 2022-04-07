/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import { injectable } from "inversify";

import {
  ClientStorage,
  downloadFromUrl,
  instanceOfUrlDownloadInput,
  instanceOfUrlUploadInput,
  metadataToHeaders,
  TransferData,
  uploadToUrl,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import { createAndUseClient } from "./Helpers";
import {
  S3ConfigDownloadInput,
  S3ConfigUploadInput,
  S3UploadInMultiplePartsInput,
} from "./Interfaces";
import { S3ClientWrapper } from "./S3ClientWrapper";
import { S3ClientWrapperFactory } from "./S3ClientWrapperFactory";

@injectable()
export class S3ClientStorage extends ClientStorage {
  constructor(private _clientWRapperFactory: S3ClientWrapperFactory) {
    super();
  }

  public override download(
    input: (UrlDownloadInput | S3ConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<Buffer>;
  public override download(
    input: (UrlDownloadInput | S3ConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<Readable>;
  public override download(
    input: (UrlDownloadInput | S3ConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;
  public override async download(
    input: UrlDownloadInput | S3ConfigDownloadInput
  ): Promise<TransferData> {
    if (instanceOfUrlDownloadInput(input)) return downloadFromUrl(input);

    return createAndUseClient(
      () => this._clientWRapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.download(
          input.reference,
          input.transferType,
          input.localPath
        )
    );
  }

  public override async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    let { data } = input;
    const { metadata } = input;

    if (instanceOfUrlUploadInput(input)) {
      if (typeof data === "string") data = createReadStream(data);

      return uploadToUrl(
        input.url,
        data,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );
    }

    return createAndUseClient(
      () => this._clientWRapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.upload(input.reference, data, metadata)
    );
  }

  public async uploadInMultipleParts(
    input: S3UploadInMultiplePartsInput
  ): Promise<void> {
    return createAndUseClient(
      () => this._clientWRapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.uploadInMultipleParts(
          input.reference,
          input.data,
          input.options
        )
    );
  }
}
