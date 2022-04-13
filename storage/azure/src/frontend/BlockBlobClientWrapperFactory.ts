/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";
import { instanceOfUrlInput } from "@itwin/object-storage-core";
import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";
import { buildBlobUrlFromConfig, TransferConfigAndReference } from "./Helpers";
import {
  AzureTransferConfig,
} from "./FrontendInterfaces";

@injectable()
export class BlockBlobClientWrapperFactory {
  public create(input: { url: string } | { transferConfig: AzureTransferConfig, reference: Object }): BlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfUrlInput(input) ? input.url : buildBlobUrlFromConfig(input as TransferConfigAndReference)
    );
    return new BlockBlobClientWrapper(blobClient);
  }
}
