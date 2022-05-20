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
  instanceOfUrlInput,
  metadataToHeaders,
  streamToTransferType,
  TransferData,
  Types,
  uploadToUrl,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import {
  S3ConfigDownloadInput,
  S3ConfigUploadInput,
  S3UploadInMultiplePartsInput,
} from "./ClientInterfaces";
import { S3ClientWrapperFactory } from "./S3ClientWrapperFactory";
import { S3ClientWrapper } from "./S3ClientWrapper";
import { createAndUseClient } from "./Helpers";

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
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    if (instanceOfUrlInput(input)) return downloadFromUrl(input);

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

    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    await assertFileNotEmpty(input.data);

    const dataToUpload: TransferData =
      typeof data === "string" ? createReadStream(data) : data;

    if (instanceOfUrlInput(input)) {
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
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    await assertFileNotEmpty(input.data);

    const dataToUpload: TransferData =
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
