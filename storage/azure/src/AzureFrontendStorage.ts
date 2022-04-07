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
  TransferData,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core/lib/frontend";

import { BlockBlobClientWrapperFactory } from "./BlockBlobClientWrapperFactory";
import {
  AzureConfigDownloadInput,
  AzureConfigUploadInput,
  AzureUploadInMultiplePartsInput,
} from "./Interfaces";

@injectable()
export class AzureFrontendStorage extends ClientStorage {
  constructor(
    private readonly _clientWrapperFactory: BlockBlobClientWrapperFactory
  ) {
    super();
  }

  public download(
    input: (UrlDownloadInput | AzureConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<Buffer>;

  public download(
    input: (UrlDownloadInput | AzureConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<Readable>;

  public download(
    input: (UrlDownloadInput | AzureConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;

  public async download(
    input: UrlDownloadInput | AzureConfigDownloadInput
  ): Promise<TransferData> {
    assertFrontendTransferType(input.transferType);

    return this._clientWrapperFactory
      .create(input)
      .download(input.transferType, input.localPath);
  }

  public async upload(
    input: UrlUploadInput | AzureConfigUploadInput
  ): Promise<void> {
    assertFrontendTransferData(input.data);

    return this._clientWrapperFactory
      .create(input)
      .upload(input.data, input.metadata);
  }

  public async uploadInMultipleParts(
    input: AzureUploadInMultiplePartsInput
  ): Promise<void> {
    assertFrontendTransferData(input.data);

    return this._clientWrapperFactory
      .create(input)
      .uploadInMultipleParts(input.data, input.options);
  }
}
