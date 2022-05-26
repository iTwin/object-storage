/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { injectable } from "inversify";

import { TransferConfig } from "@itwin/object-storage-core/lib/common";
import { assertS3TransferConfig, createS3Client } from "../../common";
import { S3ClientWrapperFrontend } from "./S3ClientWrapper";

@injectable()
export class S3ClientWrapperFactoryFrontend {
  public create(transferConfig: TransferConfig): S3ClientWrapperFrontend {
    assertS3TransferConfig(transferConfig);

    const { authentication, baseUrl, region, bucket } = transferConfig;
    const { accessKey, secretKey, sessionToken } = authentication;

    return new S3ClientWrapperFrontend(
      createS3Client({ baseUrl, region, accessKey, secretKey, sessionToken }),
      bucket
    );
  }
}
