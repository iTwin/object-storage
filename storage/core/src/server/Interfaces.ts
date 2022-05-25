/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";
import {
  ConfigTransferInput,
  Metadata,
  MultipartUploadOptions,
  ObjectReference,
  TransferConfig,
  TransferInput,
} from "../common";

export type TransferType = "buffer" | "stream" | "local";
export type TransferData = Readable | Buffer | string;
export type MultipartUploadData = Readable | string;

export interface UrlDownloadInput extends TransferInput {
  transferType: TransferType;
  localPath?: string;
}
export interface UrlUploadInput extends TransferInput {
  data: TransferData;
  metadata?: Metadata;
}

export interface ConfigDownloadInput extends ConfigTransferInput {
  transferType: TransferType;
  localPath?: string;
}
export interface ConfigUploadInput extends ConfigTransferInput {
  data: TransferData;
  metadata?: Metadata;
}

export interface UploadInMultiplePartsInput {
  data: MultipartUploadData;
  reference: ObjectReference;
  transferConfig: TransferConfig;
  options?: MultipartUploadOptions;
}
