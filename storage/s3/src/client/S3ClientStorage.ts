/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import { injectable } from "inversify";

import {
  assertFileNotEmpty,
  ClientStorage,
  downloadFromUrl,
  FrontendTransferData,
  instanceOfUrlDownloadInput,
  instanceOfUrlUploadInput,
  metadataToHeaders,
  streamToTransferType,
  TransferData,
  uploadToUrl,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import {
  createAndUseClient,
  S3ClientWrapper,
  S3ClientWrapperFactory,
} from "../frontend";

import {
  S3ConfigDownloadInput,
  S3ConfigUploadInput,
  S3UploadInMultiplePartsInput,
} from "./ClientInterfaces";

@injectable()
export class S3ClientStorage extends ClientStorage {
  constructor(private _clientWrapperFactory: S3ClientWrapperFactory) {
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
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) => {
        const downloadStream = await clientWrapper.download(input.reference);
        return streamToTransferType(
          downloadStream,
          input.transferType,
          input.localPath
        );
      }
    );
  }

  public override async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    const { data } = input;
    const { metadata } = input;

    await assertFileNotEmpty(input.data);

    const dataToUpload: FrontendTransferData =
      typeof data === "string" ? createReadStream(data) : data;

    if (instanceOfUrlUploadInput(input)) {
      return uploadToUrl(
        input.url,
        dataToUpload,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );
    }

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.upload(input.reference, dataToUpload, metadata)
    );
  }

  public async uploadInMultipleParts(
    input: S3UploadInMultiplePartsInput
  ): Promise<void> {
    await assertFileNotEmpty(input.data);

    const dataToUpload: FrontendTransferData =
      typeof input.data === "string"
        ? createReadStream(input.data)
        : input.data;

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.uploadInMultipleParts(
          input.reference,
          dataToUpload,
          input.options
        )
    );
  }
}
