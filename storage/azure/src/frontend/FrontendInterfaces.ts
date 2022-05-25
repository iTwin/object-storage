/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
} from "@itwin/object-storage-core/lib/frontend";
import { AzureTransferConfigInput } from "../common";

export type FrontendAzureConfigDownloadInput = FrontendConfigDownloadInput & AzureTransferConfigInput;

export type FrontendAzureConfigUploadInput = FrontendConfigUploadInput & AzureTransferConfigInput;

export type FrontendAzureUploadInMultiplePartsInput = FrontendUploadInMultiplePartsInput & AzureTransferConfigInput;
