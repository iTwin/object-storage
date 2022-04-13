/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import {
  FrontendConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
} from "./FrontendInterfaces";

export interface BaseFrontendStorage {
  download(
    input: (FrontendUrlDownloadInput | FrontendConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<Buffer>;

  download(
    input: (FrontendUrlDownloadInput | FrontendConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<Readable>;

  upload(
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
  ): Promise<void>;

  uploadInMultipleParts(
    input: FrontendUploadInMultiplePartsInput
  ): Promise<void>;
}
