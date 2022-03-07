/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import {
  ConfigDownloadInput,
  ConfigUploadInput,
  TransferConfig,
  UploadInMultiplePartsInput,
} from "@itwin/object-storage-core";

export interface AzureTransferConfig extends TransferConfig {
  authentication: string;
}

export interface AzureConfigDownloadInput extends ConfigDownloadInput {
  transferConfig: AzureTransferConfig;
}

export interface AzureConfigUploadInput extends ConfigUploadInput {
  transferConfig: AzureTransferConfig;
}

export interface AzureUploadInMultiplePartsInput
  extends UploadInMultiplePartsInput {
  transferConfig: AzureTransferConfig;
}
