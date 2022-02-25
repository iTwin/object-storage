/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import {
  ConfigDownloadInput,
  ConfigUploadInput,
  TransferConfig,
  UploadInMultiplePartsInput,
} from "@itwin/object-storage-core";

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

export interface S3ConfigDownloadInput extends ConfigDownloadInput {
  transferConfig: S3TransferConfig;
}

export interface S3ConfigUploadInput extends ConfigUploadInput {
  transferConfig: S3TransferConfig;
}

export interface S3UploadInMultiplePartsInput
  extends UploadInMultiplePartsInput {
  transferConfig: S3TransferConfig;
}
