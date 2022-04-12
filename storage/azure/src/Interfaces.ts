/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ConfigDownloadInput,
  ConfigUploadInput,
  FrontendConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
  TransferConfig,
  UploadInMultiplePartsInput,
} from "@itwin/object-storage-core";

export interface AzureTransferConfig extends TransferConfig {
  authentication: string;
}

export interface FrontendAzureConfigDownloadInput
  extends FrontendConfigDownloadInput {
  transferConfig: AzureTransferConfig;
}

export interface AzureConfigDownloadInput extends ConfigDownloadInput {
  transferConfig: AzureTransferConfig;
}

export interface FrontendAzureConfigUploadInput
  extends FrontendConfigUploadInput {
  transferConfig: AzureTransferConfig;
}

export interface AzureConfigUploadInput extends ConfigUploadInput {
  transferConfig: AzureTransferConfig;
}

export interface FrontendAzureUploadInMultiplePartsInput
  extends FrontendUploadInMultiplePartsInput {
  transferConfig: AzureTransferConfig;
}

export interface AzureUploadInMultiplePartsInput
  extends UploadInMultiplePartsInput {
  transferConfig: AzureTransferConfig;
}
