/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import {
  ConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
  FrontendUrlUploadInput,
  UrlDownloadInput,
} from "./StorageInterfaces";

export interface BaseFrontendStorage {
  download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "buffer" }
  ): Promise<Buffer>;

  download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "stream" }
  ): Promise<Readable>;

  upload(
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
  ): Promise<void>;

  uploadInMultipleParts(
    input: FrontendUploadInMultiplePartsInput
  ): Promise<void>;
}
