/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ConfigTransferInput,
  Metadata,
  MultipartUploadOptions,
  ObjectReference,
  TransferConfig,
  TransferInput,
} from "../common";

export type FrontendTransferType = "buffer" | "stream";
export type FrontendTransferData = ArrayBuffer | ReadableStream;
export type FrontendMultipartUploadData = ReadableStream;

export interface FrontendUrlDownloadInput extends TransferInput {
  transferType: FrontendTransferType;
}
export interface FrontendUrlUploadInput extends TransferInput {
  data: FrontendTransferData;
  metadata?: Metadata;
}

export interface FrontendConfigDownloadInput extends ConfigTransferInput {
  transferType: FrontendTransferType;
}
export interface FrontendConfigUploadInput extends ConfigTransferInput {
  data: FrontendTransferData;
  metadata?: Metadata;
}

export interface FrontendUploadInMultiplePartsInput {
  data: FrontendMultipartUploadData;
  reference: ObjectReference;
  transferConfig: TransferConfig;
  options?: MultipartUploadOptions;
}
