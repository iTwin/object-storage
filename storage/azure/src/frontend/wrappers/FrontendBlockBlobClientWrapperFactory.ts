/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import { instanceOfTransferInput, TransferInput } from "@itwin/object-storage-core/lib/common";
import { AzureTransferConfigInput, buildBlobUrlFromAzureTransferConfigInput } from "../../common";
import { FrontendBlockBlobClientWrapper } from "./FrontendBlockBlobClientWrapper";

@injectable()
export class FrontendBlockBlobClientWrapperFactory {
  public create(
    input: TransferInput | AzureTransferConfigInput
  ): FrontendBlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfTransferInput(input)
        ? input.url
        : buildBlobUrlFromAzureTransferConfigInput(input)
    );
    return new FrontendBlockBlobClientWrapper(blobClient);
  }
}
