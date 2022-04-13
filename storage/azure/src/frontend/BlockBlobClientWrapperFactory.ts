/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import {
  FrontendUrlUploadInput,
  FrontendUrlDownloadInput,
} from "@itwin/object-storage-core";

import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";
import { buildBlobUrlFromConfig, TransferConfigAndReference, instanceOfUrlInput } from "./Helpers";
import {
  AzureTransferConfig,
  FrontendAzureConfigDownloadInput,
  FrontendAzureConfigUploadInput,
  FrontendAzureUploadInMultiplePartsInput,
} from "./FrontendInterfaces";

export type AnyAzureTransferInput = // TODO
  | FrontendUrlUploadInput
  | FrontendUrlDownloadInput
  | FrontendAzureConfigDownloadInput
  | FrontendAzureConfigUploadInput
  | FrontendAzureUploadInMultiplePartsInput;


@injectable()
export class BlockBlobClientWrapperFactory {
  public create(input: { url: string } | { transferConfig: AzureTransferConfig, reference: Object }): BlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfUrlInput(input) ? input.url : buildBlobUrlFromConfig(input as TransferConfigAndReference)
    );
    return new BlockBlobClientWrapper(blobClient);
  }
}
