/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobServiceClient,
  newPipeline,
  StoragePipelineOptions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

import { RetryOptions } from "@itwin/object-storage-core";

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
    const pipelineOptions: StoragePipelineOptions = {
      retryOptions: {
        maxTries:
          this._retryOptions.maxRetries != undefined
            ? this._retryOptions.maxRetries + 1
            : undefined,
        retryDelayInMs: this._retryOptions.retryDelayMs,
        maxRetryDelayInMs: this._retryOptions.maxRetryDelayMs,
      },
    };
    return new BlobServiceClientWrapper(
      new BlobServiceClient(
        config.baseUrl,
        newPipeline(credential, pipelineOptions)
      )
    );
  }
}
