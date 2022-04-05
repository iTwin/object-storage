/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { TransferConfig } from "@itwin/object-storage-core";

import { transferConfigToS3Wrapper } from "./Helpers";
import { S3ClientWrapper } from "./S3ClientWrapper.backend";

export function transferConfigToS3ClientWrapper(
  transferConfig: TransferConfig,
  bucket: string
): S3ClientWrapper {
  return transferConfigToS3Wrapper(transferConfig, bucket, S3ClientWrapper);
}
