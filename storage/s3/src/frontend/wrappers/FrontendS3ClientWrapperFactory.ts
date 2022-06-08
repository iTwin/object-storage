/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { injectable } from "inversify";

import { TransferConfig } from "@itwin/object-storage-core/lib/frontend";

import { createS3ClientFrontend } from "..";
import { assertS3TransferConfig } from "../../common";

import { FrontendS3ClientWrapper } from "./FrontendS3ClientWrapper";

@injectable()
export class FrontendS3ClientWrapperFactory {
  public create(transferConfig: TransferConfig): FrontendS3ClientWrapper {
    assertS3TransferConfig(transferConfig);

    const { authentication, baseUrl, region, bucket } = transferConfig;
    const { accessKey, secretKey, sessionToken } = authentication;

    return new FrontendS3ClientWrapper(
      createS3ClientFrontend({
        baseUrl,
        region,
        accessKey,
        secretKey,
        sessionToken,
      }),
      bucket
    );
  }
}
