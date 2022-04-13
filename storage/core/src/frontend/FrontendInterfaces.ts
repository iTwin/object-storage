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

export interface FrontendUrlDownloadInput {
  url: string;
  transferType: FrontendTransferType;
}

export interface FrontendUrlUploadInput {
  url: string;
  data: FrontendTransferData;
  metadata?: Metadata;
}

export interface FrontendConfigDownloadInput {
  reference: ObjectReference;
  transferType: FrontendTransferType;
  transferConfig: TransferConfig;
  localPath?: string;
}

export interface FrontendConfigUploadInput {
  reference: ObjectReference;
  data: FrontendTransferData;
  transferConfig: TransferConfig;
  metadata?: Metadata;
}
export interface FrontendUploadInMultiplePartsInput {
  reference: ObjectReference;
  data: FrontendMultipartUploadData;
  transferConfig: TransferConfig;
  options?: MultipartUploadOptions;
}