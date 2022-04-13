/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ConfigDownloadInput, ConfigUploadInput, UploadInMultiplePartsInput } from "@itwin/object-storage-core";
import { S3TransferConfig } from "../frontend";

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
