/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import {
  instanceOfTransferInput,
  TransferInput,
} from "@itwin/object-storage-core/lib/common";

import {
  AzureTransferConfigInput,
  buildBlobUrlFromAzureTransferConfigInput,
} from "../../common";

import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";

@injectable()
export class BlockBlobClientWrapperFactory {
  public create(
    input: TransferInput | AzureTransferConfigInput
  ): BlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfTransferInput(input)
        ? input.url
        : buildBlobUrlFromAzureTransferConfigInput(input)
    );
    return new BlockBlobClientWrapper(blobClient);
  }
}
