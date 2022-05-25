/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";
import { injectable } from "inversify";
import { Readable } from "stream";

import {
  ConfigDownloadInput,
  ConfigUploadInput,
  UploadInMultiplePartsInput,
  UrlDownloadInput,
  UrlUploadInput,
} from "../server";

@injectable()
export abstract class ClientStorage {
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
