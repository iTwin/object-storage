/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { TokenCredential } from "@azure/core-auth";
import {
  BlobServiceClient,
  newPipeline,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

import { RetryOptions } from "@itwin/object-storage-core";

import { formatRetryOptions } from "../../common/internal";
import { isCredentialConfig } from "../internal";

import { BlobServiceClientWrapper } from "./BlobServiceClientWrapper";

export interface AzureBlobServiceConfig {
  accountName: string;
  accountKey: string;
  baseUrl: string;
}

/**
 * Authenticates with an Azure SDK token credential, such as a managed
 * identity, instead of an account key. A set `credential` takes precedence
 * over `accountKey`.
 */
export interface AzureBlobServiceCredentialConfig {
  accountName: string;
  baseUrl: string;
  credential: TokenCredential;
}

export class BlobServiceClientWrapperFactory {
  public constructor(private readonly _retryOptions: RetryOptions = {}) {}

  public create(
    config: AzureBlobServiceConfig | AzureBlobServiceCredentialConfig
  ): BlobServiceClientWrapper {
    const credential = isCredentialConfig(config)
      ? config.credential
      : new StorageSharedKeyCredential(config.accountName, config.accountKey);
    return new BlobServiceClientWrapper(
      new BlobServiceClient(
        config.baseUrl,
        newPipeline(credential, formatRetryOptions(this._retryOptions))
      )
    );
  }
}
