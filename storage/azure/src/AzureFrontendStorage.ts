/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { injectable } from "inversify";

import {
  assertFrontendTransferData,
  assertFrontendTransferType,
  FrontendStorage,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
  streamToTransferTypeFrontend,
  TransferData,
} from "@itwin/object-storage-core/lib/frontend";

import { BlockBlobClientWrapperFactory } from "./BlockBlobClientWrapperFactory";
import {
  FrontendAzureConfigDownloadInput,
  FrontendAzureConfigUploadInput,
  FrontendAzureUploadInMultiplePartsInput,
} from "./Interfaces";

@injectable()
export class AzureFrontendStorage extends FrontendStorage {
  constructor(
    private readonly _clientWrapperFactory: BlockBlobClientWrapperFactory
  ) {
    super();
  }

  public download(
    input: (FrontendUrlDownloadInput | FrontendAzureConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<Buffer>;

  public download(
    input: (FrontendUrlDownloadInput | FrontendAzureConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<Readable>;

  public async download(
    input: FrontendUrlDownloadInput | FrontendAzureConfigDownloadInput
  ): Promise<TransferData> {
    assertFrontendTransferType(input.transferType);

    const downloadStream = await this._clientWrapperFactory
      .create(input)
      .download();

    return streamToTransferTypeFrontend(downloadStream, input.transferType);
  }

  public async upload(
    input: FrontendUrlUploadInput | FrontendAzureConfigUploadInput
  ): Promise<void> {
    assertFrontendTransferData(input.data);

    return this._clientWrapperFactory
      .create(input)
      .upload(input.data, input.metadata);
  }

  public async uploadInMultipleParts(
    input: FrontendAzureUploadInMultiplePartsInput
  ): Promise<void> {
    assertFrontendTransferData(input.data);

    return this._clientWrapperFactory
      .create(input)
      .uploadInMultipleParts(input.data, input.options);
  }
}
