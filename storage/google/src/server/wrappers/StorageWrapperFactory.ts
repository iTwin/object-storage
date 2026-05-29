/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Storage } from "@google-cloud/storage";

import { RetryOptions } from "@itwin/object-storage-core";

import { GoogleTransferConfig } from "../../common/Interfaces";

import { GoogleStorageConfig } from "./GoogleStorageConfig";
import { StorageWrapper } from "./StorageWrapper";

export class StorageWrapperFactory {
  public constructor(private readonly _retryOptions: RetryOptions = {}) {}

  public createDefaultApplication(config: GoogleStorageConfig): StorageWrapper {
    return new StorageWrapper(
      new Storage({
        projectId: config.projectId,
        retryOptions: {
          autoRetry: true,
          maxRetries: this._retryOptions.maxRetries,
          maxRetryDelay:
            this._retryOptions.maxRetryDelayMs !== undefined
              ? this._retryOptions.maxRetryDelayMs / 1000
              : undefined,
        },
      }),
      config
    );
  }

  public createFromToken(transferConfig: GoogleTransferConfig): StorageWrapper {
    return new StorageWrapper(
      new Storage({
        token: transferConfig.authentication,
        retryOptions: {
          autoRetry: true,
          maxRetries: this._retryOptions.maxRetries,
          maxRetryDelay:
            this._retryOptions.maxRetryDelayMs !== undefined
              ? this._retryOptions.maxRetryDelayMs / 1000
              : undefined,
        },
      }),
      { bucketName: transferConfig.bucketName }
    );
  }
}
