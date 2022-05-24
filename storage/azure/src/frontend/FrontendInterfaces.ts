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

export interface AzureTransferConfig extends TransferConfig {
  authentication: string;
}

export interface AzureTransferConfigInput {
  transferConfig: AzureTransferConfig;
}

export type FrontendAzureConfigDownloadInput = FrontendConfigDownloadInput &
  AzureTransferConfigInput;

export type FrontendAzureConfigUploadInput = FrontendConfigUploadInput &
  AzureTransferConfigInput;

export type FrontendAzureUploadInMultiplePartsInput =
  FrontendUploadInMultiplePartsInput & AzureTransferConfigInput;
