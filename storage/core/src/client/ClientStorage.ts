/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { Readable } from "stream";

import { injectable } from "inversify";

import { BaseFrontendStorage } from "../frontend";

import {
  ConfigDownloadInput,
  ConfigUploadInput,
  UploadInMultiplePartsInput,
  UrlDownloadInput,
  UrlUploadInput,
} from "./ClientInterfaces";

@injectable()
export abstract class ClientStorage implements BaseFrontendStorage {
  public abstract download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "buffer" }
  ): Promise<Buffer>;

  public abstract download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "stream" }
  ): Promise<Readable>;

  public abstract download(
    input: (UrlDownloadInput | ConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;

  public abstract upload(
    input: UrlUploadInput | ConfigUploadInput
  ): Promise<void>;

  public abstract uploadInMultipleParts(
    input: UploadInMultiplePartsInput
  ): Promise<void>;
}
