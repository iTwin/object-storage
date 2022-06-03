/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";

import {
  FrontendStorage,
  FrontendTransferData,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
  Types,
} from "@itwin/object-storage-core/lib/frontend";

import {
  FrontendAzureConfigDownloadInput,
  FrontendAzureConfigUploadInput,
  FrontendAzureUploadInMultiplePartsInput,
} from "./FrontendInterfaces";
import { FrontendBlockBlobClientWrapperFactory } from "./wrappers";

@injectable()
export class AzureFrontendStorage extends FrontendStorage {
  constructor(
    @inject(Types.Frontend.clientWrapperFactory)
    private _clientWrapperFactory: FrontendBlockBlobClientWrapperFactory
  ) {
    super();
  }

  public download(
    input: (FrontendUrlDownloadInput | FrontendAzureConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<ArrayBuffer>;

  public download(
    input: (FrontendUrlDownloadInput | FrontendAzureConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<ReadableStream>;

  public async download(
    input: FrontendUrlDownloadInput | FrontendAzureConfigDownloadInput
  ): Promise<FrontendTransferData> {
    const downloadBlob = await this._clientWrapperFactory
      .create(input)
      .download();
      
    switch(input.transferType) {
      case "buffer":
        return downloadBlob.arrayBuffer();
      case "stream":
        return downloadBlob.stream();
      default:
        throw new Error(`Transfer type ${input.transferType} is unsupported`);
    }
  }

  public async upload(
    input: FrontendUrlUploadInput | FrontendAzureConfigUploadInput
  ): Promise<void> {
    return this._clientWrapperFactory
      .create(input)
      .upload(input.data, input.metadata);
  }

  public async uploadInMultipleParts(
    input: FrontendAzureUploadInMultiplePartsInput
  ): Promise<void> {
    return this._clientWrapperFactory
      .create(input)
      .uploadInMultipleParts(input.data, input.options);
  }
}
