/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";
import { inject, injectable } from "inversify";

import {
  Types,
  assertRelativeDirectory,
  metadataToHeaders,
  instanceOfTransferInput
} from "@itwin/object-storage-core/lib/common";
import {
  ClientStorage
} from "@itwin/object-storage-core/lib/client";
import {
  downloadFromUrl,
  streamToTransferType,
  TransferData,
  uploadToUrl,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core/lib/server";
import {
  S3ClientWrapper,
  S3ClientWrapperFactory,
  S3ConfigDownloadInput,
  S3ConfigUploadInput,
  S3UploadInMultiplePartsInput,
  createAndUseClient
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
    
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    if (instanceOfTransferInput(input)) return downloadFromUrl(input);

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

    if( instanceOfTransferInput(input) )
      return uploadToUrl(
        input.url,
        input.data,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );
    else
      return createAndUseClient(
        () => this._clientWrapperFactory.create(input.transferConfig),
        async (clientWrapper: S3ClientWrapper) => clientWrapper.upload(
          input.reference,
          data,
          metadata
        )
      );
  }

  public async uploadInMultipleParts(
    input: S3UploadInMultiplePartsInput
  ): Promise<void> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);

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
