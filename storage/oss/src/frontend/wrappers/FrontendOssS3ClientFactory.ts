/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  RetryOptions,
  TransferConfig,
} from "@itwin/object-storage-core/lib/frontend";
import { assertS3TransferConfig } from "@itwin/object-storage-s3/lib/common/internal";
import {
  FrontendS3ClientWrapper,
  FrontendS3ClientWrapperFactory,
} from "@itwin/object-storage-s3/lib/frontend";

import { createOssS3ClientFrontend } from "../internal";

export class FrontendOssS3ClientWrapperFactory extends FrontendS3ClientWrapperFactory {
  public constructor(retryOptions: RetryOptions = {}) {
    super(retryOptions);
  }

  public override create(
    transferConfig: TransferConfig
  ): FrontendS3ClientWrapper {
    assertS3TransferConfig(transferConfig);

    const { authentication, baseUrl, region, bucket } = transferConfig;
    const { accessKey, secretKey, sessionToken } = authentication;

    return new FrontendS3ClientWrapper(
      createOssS3ClientFrontend({
        baseUrl,
        region,
        accessKey,
        secretKey,
        sessionToken,
        retryOptions: this._retryOptions,
      }),
      bucket
    );
  }
}
