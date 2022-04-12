/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { injectable } from "inversify";

import {
  assertFrontendTransferData,
  assertFrontendTransferType,
  downloadFromUrlFrontendFriendly,
  FrontendConfigUploadInput,
  FrontendStorage,
  FrontendUploadInMultiplePartsInput,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
  instanceOfUrlDownloadInput,
  instanceOfUrlUploadInput,
  metadataToHeaders,
  streamToTransferTypeFrontend,
  TransferData,
  uploadToUrl,
  UrlDownloadInput,
} from "@itwin/object-storage-core/lib/frontend";

import { createAndUseClient } from "./Helpers";
import { FrontendS3ConfigDownloadInput } from "./Interfaces";
import { S3ClientWrapper } from "./S3ClientWrapper";
import { S3ClientWrapperFactory } from "./S3ClientWrapperFactory";

@injectable()
export class S3FrontendStorage extends FrontendStorage {
  public constructor(private _clientWrapperFactory: S3ClientWrapperFactory) {
    super();
  }

  public download(
    input: (UrlDownloadInput | FrontendS3ConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<Buffer>;

  public download(
    input: (UrlDownloadInput | FrontendS3ConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<Readable>;

  public async download(
    input: FrontendUrlDownloadInput | FrontendS3ConfigDownloadInput
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
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
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
    input: FrontendUploadInMultiplePartsInput
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
