/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream, promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import { inject, injectable } from "inversify";

import {
  assertFileNotEmpty,
  assertRelativeDirectory,
  ClientStorage,
  FrontendTransferData,
  isLocalUrlTransfer,
  streamToTransferType,
  TransferData,
  Types,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import { BlockBlobClientWrapperFactory } from "../frontend";

import {
  AzureConfigDownloadInput,
  AzureConfigUploadInput,
  AzureUploadInMultiplePartsInput,
} from "./ClientInterfaces";

@injectable()
export class AzureClientStorage extends ClientStorage {
  constructor(
    @inject(Types.Client.clientWrapperFactory)
    private _clientWrapperFactory: BlockBlobClientWrapperFactory
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
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);

    if (isLocalUrlTransfer(input))
      await promises.mkdir(dirname(input.localPath), { recursive: true });

    const downloadStream = await this._clientWrapperFactory
      .create(input)
      .download();

    return streamToTransferType(
      downloadStream,
      input.transferType,
      input.localPath
    );
  }

  public async upload(
    input: UrlUploadInput | AzureConfigUploadInput
  ): Promise<void> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    await assertFileNotEmpty(input.data);

    const dataToUpload: FrontendTransferData =
      typeof input.data === "string"
        ? createReadStream(input.data)
        : input.data;

    return this._clientWrapperFactory
      .create(input)
      .upload(dataToUpload, input.metadata);
  }

  public async uploadInMultipleParts(
    input: AzureUploadInMultiplePartsInput
  ): Promise<void> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    await assertFileNotEmpty(input.data);

    const dataToUpload: FrontendTransferData =
      typeof input.data === "string"
        ? createReadStream(input.data)
        : input.data;

    return this._clientWrapperFactory
      .create(input)
      .uploadInMultipleParts(dataToUpload, input.options);
  }
}
