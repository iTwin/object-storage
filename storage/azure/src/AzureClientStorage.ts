/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import {
  assertFileNotEmpty,
  ClientStorage,
  isLocalUrlTransfer,
  TransferData,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import { BlockBlobClientWrapperFactory } from "./BlockBlobClientWrapperFactory";
import {
  AzureConfigDownloadInput,
  AzureConfigUploadInput,
  AzureUploadInMultiplePartsInput,
} from "./Interfaces";

export class AzureClientStorage extends ClientStorage {
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
    if (isLocalUrlTransfer(input))
      await promises.mkdir(dirname(input.localPath), { recursive: true });

    return this._clientWrapperFactory
      .create(input)
      .download(input.transferType, input.localPath);
  }

  public async upload(
    input: UrlUploadInput | AzureConfigUploadInput
  ): Promise<void> {
    await assertFileNotEmpty(input.data);

    return this._clientWrapperFactory
      .create(input)
      .upload(input.data, input.metadata);
  }

  public async uploadInMultipleParts(
    input: AzureUploadInMultiplePartsInput
  ): Promise<void> {
    await assertFileNotEmpty(input.data);

    return this._clientWrapperFactory
      .create(input)
      .uploadInMultipleParts(input.data, input.options);
  }
}
