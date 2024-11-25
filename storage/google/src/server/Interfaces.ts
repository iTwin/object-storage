/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ConfigDownloadInput,
  ConfigUploadInput,
  UploadInMultiplePartsInput,
} from "@itwin/object-storage-core";

import { GoogleTransferConfig } from "../common";

export interface GoogleConfigDownloadInput extends ConfigDownloadInput {
  transferConfig: GoogleTransferConfig;
}

export interface GoogleConfigUploadInput extends ConfigUploadInput {
  transferConfig: GoogleTransferConfig;
}

export interface GoogleUploadInMultiplePartsInput
  extends UploadInMultiplePartsInput {
  transferConfig: GoogleTransferConfig;
}
