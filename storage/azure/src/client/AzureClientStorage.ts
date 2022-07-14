/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import { inject, injectable } from "inversify";

import { assertRelativeDirectory } from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  isLocalTransferInput,
  streamToTransferType,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  ClientStorage,
  TransferData,
  Types,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import {
  AzureConfigDownloadInput,
  AzureConfigUploadInput,
  AzureUploadInMultiplePartsInput,
} from "../server";
import { BlockBlobClientWrapperFactory } from "../server/wrappers";

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

    if (isLocalTransferInput(input))
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
    if (typeof input.data === "string") await assertFileNotEmpty(input.data);

    return this._clientWrapperFactory
      .create(input)
      .upload(input.data, input.metadata);
  }

  public async uploadInMultipleParts(
    input: AzureUploadInMultiplePartsInput
  ): Promise<void> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    if (typeof input.data === "string") await assertFileNotEmpty(input.data);

    return this._clientWrapperFactory
      .create(input)
      .uploadInMultipleParts(input.data, input.options);
  }
}
