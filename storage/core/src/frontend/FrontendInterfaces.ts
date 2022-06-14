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
  UrlTransferInput,
} from "../common";

export type FrontendTransferType = "buffer" | "stream";
export type FrontendTransferData = ArrayBuffer | ReadableStream;
export type FrontendMultipartUploadData = ReadableStream;

export interface FrontendUrlDownloadInput extends UrlTransferInput {
  transferType: FrontendTransferType;
}
export interface FrontendUrlUploadInput extends UrlTransferInput {
  data: ArrayBuffer;
  metadata?: Metadata;
}

export interface FrontendConfigDownloadInput extends ConfigTransferInput {
  transferType: FrontendTransferType;
}
export interface FrontendConfigUploadInput extends ConfigTransferInput {
  data: ArrayBuffer;
  metadata?: Metadata;
}

export interface FrontendUploadInMultiplePartsInput {
  data: FrontendMultipartUploadData;
  reference: ObjectReference;
  transferConfig: TransferConfig;
  options?: MultipartUploadOptions;
}
