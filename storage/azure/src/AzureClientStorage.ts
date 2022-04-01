/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Readable } from "stream";

import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import {
  ClientStorage,
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
export class AzureClientStorage extends ClientStorage {
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
    let url = instanceOfUrlDownloadInput(input)
      ? input.url
      : buildBlobUrlFromConfig(input);

    if (url.includes("file.core.windows.net")) {
      url = url.replace("file.core.windows.net", "foo");
    }
    const blobClient = new BlockBlobClient(
      url
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
