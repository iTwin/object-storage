/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/

import { Readable } from "stream";

import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import {
  ClientSideStorage,
  instanceOfUrlDownloadInput,
  instanceOfUrlUploadInput,
  TransferData,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";
import { buildBlobUrlFromConfig } from "./Helpers";
import {
  AzureConfigDownloadInput,
  AzureConfigUploadInput,
  AzureUploadInMultiplePartsInput,
} from "./Interfaces";

@injectable()
export class AzureClientSideBlobStorage extends ClientSideStorage {
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
    const blobClient = new BlockBlobClient(
      instanceOfUrlDownloadInput(input)
        ? input.url
        : buildBlobUrlFromConfig(input)
    );

    return new BlockBlobClientWrapper(blobClient).download(
      input.transferType,
      input.localPath
    );
  }

  public async upload(
    input: UrlUploadInput | AzureConfigUploadInput
  ): Promise<void> {
    const blobClient = new BlockBlobClient(
      instanceOfUrlUploadInput(input)
        ? input.url
        : buildBlobUrlFromConfig(input)
    );

    return new BlockBlobClientWrapper(blobClient).upload(
      input.data,
      input.metadata
    );
  }

  public async uploadInMultipleParts(
    input: AzureUploadInMultiplePartsInput
  ): Promise<void> {
    const blobClient = new BlockBlobClient(buildBlobUrlFromConfig(input));

    return new BlockBlobClientWrapper(blobClient).uploadInMultipleParts(
      input.data,
      input.options
    );
  }
}
