/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import {
  instanceOfUrlTransferInput,
  UrlTransferInput,
} from "@itwin/object-storage-core";

import {
  AzureTransferConfigInput,
  buildBlobUrlFromAzureTransferConfigInput,
} from "../../common";

import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";

@injectable()
export class BlockBlobClientWrapperFactory {
  public create(
    input: UrlTransferInput | AzureTransferConfigInput
  ): BlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfUrlTransferInput(input)
        ? input.url
        : buildBlobUrlFromAzureTransferConfigInput(input)
    );
    return new BlockBlobClientWrapper(blobClient);
  }
}
