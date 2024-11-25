/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  FrontendConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
} from "@itwin/object-storage-core/lib/frontend";

import { GoogleTransferConfig } from "../common";

export interface FrontendGoogleConfigDownloadInput
  extends FrontendConfigDownloadInput {
  transferConfig: GoogleTransferConfig;
}

export interface FrontendGoogleConfigUploadInput
  extends FrontendConfigUploadInput {
  transferConfig: GoogleTransferConfig;
}

export interface FrontendGoogleUploadInMultiplePartsInput
  extends FrontendUploadInMultiplePartsInput {
  transferConfig: GoogleTransferConfig;
}
