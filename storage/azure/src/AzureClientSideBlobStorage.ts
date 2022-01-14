/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/

import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import {
  buildObjectKey,
  ClientSideStorage,
  ConfigDownloadInput,
  ConfigUploadInput,
  instanceOfUrlDownloadInput,
  instanceOfUrlUploadInput,
  TransferData,
  UploadInMultiplePartsInput,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";

function buildBlobUrlFromConfig(
  input: ConfigDownloadInput | ConfigUploadInput
) {
  const { transferConfig, reference } = input;
  const { authentication, baseUrl } = transferConfig;

  return `${baseUrl}/${buildObjectKey(reference)}?${authentication}`;
}

@injectable()
export class AzureClientSideBlobStorage extends ClientSideStorage {
  public async download(
    input: UrlDownloadInput | ConfigDownloadInput
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
    input: UrlUploadInput | ConfigUploadInput
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
    input: UploadInMultiplePartsInput
  ): Promise<void> {
    const blobClient = new BlockBlobClient(buildBlobUrlFromConfig(input));

    return new BlockBlobClientWrapper(blobClient).uploadInMultipleParts(
      input.data,
      input.options
    );
  }
}
