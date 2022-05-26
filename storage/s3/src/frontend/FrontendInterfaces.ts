/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
} from "@itwin/object-storage-core/lib/frontend";
import { S3TransferConfig } from "../common";

export interface FrontendS3ConfigDownloadInput extends FrontendConfigDownloadInput {
  transferConfig: S3TransferConfig;
}

export interface FrontendS3ConfigUploadInput extends FrontendConfigUploadInput {
  transferConfig: S3TransferConfig;
}

export interface FrontendS3UploadInMultiplePartsInput extends FrontendUploadInMultiplePartsInput {
  transferConfig: S3TransferConfig;
}
