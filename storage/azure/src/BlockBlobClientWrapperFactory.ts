/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";

import {
  instanceOfUrlInput,
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

type AnyAzureTransferInput =
  | UrlUploadInput
  | UrlDownloadInput
  | AzureConfigUploadInput
  | AzureConfigDownloadInput
  | AzureUploadInMultiplePartsInput;

export class BlockBlobClientWrapperFactory {
  public create(input: AnyAzureTransferInput): BlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfUrlInput(input) ? input.url : buildBlobUrlFromConfig(input)
    );
    return new BlockBlobClientWrapper(blobClient);
  }
}
