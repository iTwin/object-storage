/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { injectable } from "inversify";

import {
  Metadata,
  MultipartUploadOptions,
  ObjectReference,
  TransferConfig,
  TransferData,
  TransferType,
} from ".";

@injectable()
export abstract class ClientSideStorage {
  public abstract download(
    input: UrlDownloadInput | ConfigDownloadInput
  ): Promise<TransferData>;

  public abstract upload(
    input: UrlUploadInput | ConfigUploadInput
  ): Promise<void>;

  public abstract uploadInMultipleParts(
    input: UploadInMultiplePartsInput
  ): Promise<void>;
}

export interface UrlDownloadInput {
  url: string;
  transferType: TransferType;
  localPath?: string;
}

export interface UrlUploadInput {
  url: string;
  data: TransferData;
  metadata?: Metadata;
}

export interface ConfigDownloadInput {
  reference: ObjectReference;
  transferType: TransferType;
  transferConfig: TransferConfig;
  localPath?: string;
}

export interface ConfigUploadInput {
  reference: ObjectReference;
  data: TransferData;
  transferConfig: TransferConfig;
  metadata?: Metadata;
}

export interface UploadInMultiplePartsInput {
  reference: ObjectReference;
  data: TransferData;
  transferConfig: TransferConfig;
  options?: MultipartUploadOptions;
}

export function instanceOfUrlDownloadInput(
  input: unknown
): input is UrlDownloadInput {
  return "url" in (input as UrlDownloadInput);
}

export function instanceOfUrlUploadInput(
  input: unknown
): input is UrlUploadInput {
  return "url" in (input as UrlUploadInput);
}
