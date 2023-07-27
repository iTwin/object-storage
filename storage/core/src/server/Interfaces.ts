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
  UrlTransferInput,
} from "../common";

export type TransferType = "buffer" | "stream" | "local";
export type TransferData = Readable | Buffer | string;
export type MultipartUploadData = Readable | string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbortSignalListener = (this: GenericAbortSignal, ev: any) => any;

export interface GenericAbortSignal {
  aborted: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onabort: ((this: any, ev: any) => any) | null;
  addEventListener: (type: "abort", listener: AbortSignalListener) => void;
  removeEventListener: (type: "abort", listener: AbortSignalListener) => void;
}

export interface UrlDownloadInput extends UrlTransferInput {
  transferType: TransferType;
  localPath?: string;
  abortSignal?: GenericAbortSignal;
}

export interface UrlUploadInput extends UrlTransferInput {
  data: TransferData;
  metadata?: Metadata;
}

export interface ConfigDownloadInput extends ConfigTransferInput {
  transferType: TransferType;
  localPath?: string;
  abortSignal?: GenericAbortSignal;
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

export type ExpiryOptions =
  | {
      expiresInSeconds?: never;
      expiresOn?: Date;
    }
  | {
      expiresOn?: never;
      expiresInSeconds?: number;
    };
