/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobServiceClient,
  newPipeline,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

import { RetryOptions } from "@itwin/object-storage-core";

import { formatRetryOptions } from "../../common/internal";

import { BlobServiceClientWrapper } from "./BlobServiceClientWrapper";

export interface AzureBlobServiceConfig {
  accountName: string;
  accountKey: string;
  baseUrl: string;
}

export class BlobServiceClientWrapperFactory {
  public constructor(private readonly _retryOptions: RetryOptions = {}) {}

  public create(config: AzureBlobServiceConfig): BlobServiceClientWrapper {
    const credential = new StorageSharedKeyCredential(
      config.accountName,
      config.accountKey
    );
    return new BlobServiceClientWrapper(
      new BlobServiceClient(
        config.baseUrl,
        newPipeline(credential, formatRetryOptions(this._retryOptions))
      )
    );
  }
}
