/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import {
  instanceOfUrlTransferInput,
  UrlTransferInput,
} from "@itwin/object-storage-core/lib/frontend";

import { AzureTransferConfigInput, buildBlobUrl } from "../../common";

import { FrontendBlockBlobClientWrapper } from "./FrontendBlockBlobClientWrapper";

@injectable()
export class FrontendBlockBlobClientWrapperFactory {
  public create(
    input: UrlTransferInput | AzureTransferConfigInput
  ): FrontendBlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfUrlTransferInput(input) ? input.url : buildBlobUrl(input)
    );
    return new FrontendBlockBlobClientWrapper(blobClient);
  }
}
