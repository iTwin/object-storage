/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
  TransferConfig,
} from "@itwin/object-storage-core";

export interface AzureTransferConfig extends TransferConfig {
  authentication: string;
}

export interface FrontendAzureConfigDownloadInput
  extends FrontendConfigDownloadInput {
  transferConfig: AzureTransferConfig;
}

export interface FrontendAzureConfigUploadInput
  extends FrontendConfigUploadInput {
  transferConfig: AzureTransferConfig;
}


export interface FrontendAzureUploadInMultiplePartsInput
  extends FrontendUploadInMultiplePartsInput {
  transferConfig: AzureTransferConfig;
}
