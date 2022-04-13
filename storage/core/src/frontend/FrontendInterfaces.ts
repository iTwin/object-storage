/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

export type FrontendTransferType = "buffer" | "stream";
export type FrontendTransferData = Buffer | Readable;
export type FrontendMultipartUploadData = Readable;

export interface Metadata {
  [key: string]: string;
}

export interface MultipartUploadOptions {
  partSize?: number;
  queueSize?: number;
  metadata?: Metadata;
}

export interface BaseDirectory {
  /** Container for Azure. First directory of a prefix for S3. */
  baseDirectory: string;
}

export interface ObjectDirectory extends BaseDirectory {
  /** Additional directories in the path to object. */
  relativeDirectory?: string;
}

export interface ObjectReference extends ObjectDirectory {
  objectName: string;
}

export interface TransferConfig {
  baseUrl: string;
  expiration: Date;
}

export interface ObjectProperties {
  reference: ObjectReference;
  size: number;
  lastModified: Date;
  metadata?: Metadata;
}

export interface FrontendUrlTransferInput {
  url: string;
}

export interface FrontendUrlDownloadInput extends FrontendUrlTransferInput {
  transferType: FrontendTransferType;
}

export interface FrontendUrlUploadInput extends FrontendUrlTransferInput {
  data: FrontendTransferData;
  metadata?: Metadata;
}

export interface FrontendConfigTransferInput {
  reference: ObjectReference;
  transferConfig: TransferConfig;
}

export interface FrontendConfigDownloadInput
  extends FrontendConfigTransferInput {
  transferType: FrontendTransferType;
}

export interface FrontendConfigUploadInput extends FrontendConfigTransferInput {
  data: FrontendTransferData;
  metadata?: Metadata;
}

export interface FrontendUploadInMultiplePartsInput {
  reference: ObjectReference;
  data: FrontendMultipartUploadData;
  transferConfig: TransferConfig;
  options?: MultipartUploadOptions;
}
