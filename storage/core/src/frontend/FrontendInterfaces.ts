/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { DependencyConfig } from "@itwin/cloud-agnostic-core";

import {
  ConfigTransferInput,
  Metadata,
  MultipartUploadOptions,
  ObjectReference,
  TransferConfig,
  UrlTransferInput,
  RetryOptions,
} from "../common";

export type FrontendTransferType = "buffer" | "stream";
export type FrontendTransferData = ArrayBuffer | ReadableStream;
export type FrontendMultipartUploadData = ReadableStream;

export interface FrontendStorageBindingsConfig extends DependencyConfig {
  retryOptions?: RetryOptions;
}

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
