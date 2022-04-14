/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ConfigDownloadInput,
  ConfigUploadInput,
  UploadInMultiplePartsInput,
} from "@itwin/object-storage-core";

import { AzureTransferConfig } from "../frontend";

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
