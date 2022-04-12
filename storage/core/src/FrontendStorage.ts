/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { Readable } from "stream";

import { injectable } from "inversify";

import { BaseFrontendStorage } from "./BaseFrontendStorage";

import {
  ConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
  FrontendUrlUploadInput,
  UrlDownloadInput,
} from ".";

@injectable()
export abstract class FrontendStorage implements BaseFrontendStorage {
  public abstract download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "buffer" }
  ): Promise<Buffer>;

  public abstract download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "stream" }
  ): Promise<Readable>;

  public abstract upload(
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
  ): Promise<void>;

  public abstract uploadInMultipleParts(
    input: FrontendUploadInMultiplePartsInput
  ): Promise<void>;
}
