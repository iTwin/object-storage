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

import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

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
 * identity, instead of an account key. Used only when `accountKey` is absent.
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
    let credential: StorageSharedKeyCredential | TokenCredential;
    if (isCredentialConfig(config)) {
      // newPipeline(undefined) silently creates an anonymous client.
      if (!config.credential)
        throw new ConfigError<AzureBlobServiceCredentialConfig>("credential");
      credential = config.credential;
    } else {
      credential = new StorageSharedKeyCredential(
        config.accountName,
        config.accountKey
      );
    }
    return new BlobServiceClientWrapper(
      new BlobServiceClient(
        config.baseUrl,
        newPipeline(credential, formatRetryOptions(this._retryOptions))
      )
    );
  }
}
