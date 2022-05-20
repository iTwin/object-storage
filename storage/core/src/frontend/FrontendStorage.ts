/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { injectable } from "inversify";

import {
  FrontendConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
} from "./FrontendInterfaces";

@injectable()
export abstract class FrontendStorage {
  public abstract download(
    input: (FrontendUrlDownloadInput | FrontendConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<ArrayBuffer>;

  public abstract download(
    input: (FrontendUrlDownloadInput | FrontendConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<ReadableStream>;

  public abstract upload(
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
  ): Promise<void>;

  public abstract uploadInMultipleParts(
    input: FrontendUploadInMultiplePartsInput
  ): Promise<void>;
}
