/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import { inject, injectable } from "inversify";

import {
  assertFileNotEmpty,
  assertRelativeDirectory,
  ClientStorage,
  downloadFromUrl,
  instanceOfTransferInput,
  metadataToHeaders,
  streamToTransferType,
  TransferData,
  Types,
  uploadToUrl,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import {
  createAndUseClient,
  S3ClientWrapper,
  S3ClientWrapperFactory,
  S3ConfigDownloadInput,
  S3ConfigUploadInput,
  S3UploadInMultiplePartsInput,
} from "../server";

@injectable()
export class S3ClientStorage extends ClientStorage {
  constructor(
    @inject(Types.Client.clientWrapperFactory)
    private _clientWrapperFactory: S3ClientWrapperFactory
  ) {
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
    if (instanceOfTransferInput(input)) return downloadFromUrl(input);
    else assertRelativeDirectory(input.reference.relativeDirectory);

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
    let { data } = input;
    const { metadata } = input;

    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);

    if (typeof data === "string") {
      await assertFileNotEmpty(data);
      data = createReadStream(data);
    }

    if (instanceOfTransferInput(input))
      return uploadToUrl(
        input.url,
        data,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );
    else {
      return createAndUseClient(
        () => this._clientWrapperFactory.create(input.transferConfig),
        async (clientWrapper: S3ClientWrapper) =>
          clientWrapper.upload(input.reference, data, metadata)
      );
    }
  }

  public async uploadInMultipleParts(
    input: S3UploadInMultiplePartsInput
  ): Promise<void> {
    let { data } = input;
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    if (typeof data === "string") {
      await assertFileNotEmpty(data);
      data = createReadStream(data);
    }

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.uploadInMultipleParts(
          input.reference,
          data,
          input.options
        )
    );
  }
}
