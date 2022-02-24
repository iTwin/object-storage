/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { TransferConfig } from "@itwin/object-storage-core";

export interface S3Credentials {
  accessKey: string;
  secretKey: string;
}

export interface TemporaryS3Credentials extends S3Credentials {
  sessionToken: string;
}

export interface S3TransferConfig extends TransferConfig {
  authentication: TemporaryS3Credentials;
  region: string;
}
