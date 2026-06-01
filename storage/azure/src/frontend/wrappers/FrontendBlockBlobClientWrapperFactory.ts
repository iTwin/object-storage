/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";

import { instanceOfUrlTransferInput } from "@itwin/object-storage-core/lib/common/internal";
import {
  RetryOptions,
  UrlTransferInput,
} from "@itwin/object-storage-core/lib/frontend";

import { AzureTransferConfigInput } from "../../common";
import { buildBlobUrl, formatRetryOptions } from "../../common/internal";

import { FrontendBlockBlobClientWrapper } from "./FrontendBlockBlobClientWrapper";

export class FrontendBlockBlobClientWrapperFactory {
  public constructor(private readonly _retryOptions: RetryOptions = {}) {}

  public create(
    input: UrlTransferInput | AzureTransferConfigInput
  ): FrontendBlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfUrlTransferInput(input) ? input.url : buildBlobUrl(input),
      undefined,
      formatRetryOptions(this._retryOptions)
    );
    return new FrontendBlockBlobClientWrapper(blobClient);
  }
}
