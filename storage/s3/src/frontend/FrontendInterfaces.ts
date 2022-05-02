/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
  TransferConfig,
} from "@itwin/object-storage-core/lib/frontend";

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
  bucket: string;
}

export interface FrontendS3ConfigDownloadInput
  extends FrontendConfigDownloadInput {
  transferConfig: S3TransferConfig;
}

export interface FrontendS3ConfigUploadInput extends FrontendConfigUploadInput {
  transferConfig: S3TransferConfig;
}

export interface FrontendS3UploadInMultiplePartsInput
  extends FrontendUploadInMultiplePartsInput {
  transferConfig: S3TransferConfig;
}
