/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { injectable } from "inversify";

import {
  assertFrontendTransferData,
  assertFrontendTransferType,
  ClientStorage,
  downloadFromUrlFrontendFriendly,
  instanceOfUrlDownloadInput,
  instanceOfUrlUploadInput,
  metadataToHeaders,
  streamToTransferTypeFrontend,
  TransferData,
  uploadToUrl,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core/lib/frontend";

import { createAndUseClient } from "./Helpers";
import {
  S3ConfigDownloadInput,
  S3ConfigUploadInput,
  S3UploadInMultiplePartsInput,
} from "./Interfaces";
import { S3ClientWrapper } from "./S3ClientWrapper";
import { S3ClientWrapperFactory } from "./S3ClientWrapperFactory";

@injectable()
export class S3FrontendStorage extends ClientStorage {
  public constructor(private _clientWrapperFactory: S3ClientWrapperFactory) {
    super();
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
    assertFrontendTransferType(input.transferType);

    if (instanceOfUrlDownloadInput(input))
      return downloadFromUrlFrontendFriendly(input);

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) => {
        const downloadStream = await clientWrapper.download(input.reference);
        return streamToTransferTypeFrontend(downloadStream, input.transferType);
      }
    );
  }

  public async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    assertFrontendTransferData(input.data);

    const { data, metadata } = input;

    if (instanceOfUrlUploadInput(input))
      return uploadToUrl(
        input.url,
        data,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.upload(input.reference, data, metadata)
    );
  }

  public async uploadInMultipleParts(
    input: S3UploadInMultiplePartsInput
  ): Promise<void> {
    assertFrontendTransferData(input.data);

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.uploadInMultipleParts(
          input.reference,
          input.data,
          input.options
        )
    );
  }
}
