/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

export type TransferType = "buffer" | "stream" | "local";
export type TransferData = Buffer | Readable | string;
export type MultipartUploadData = Readable | string;

export interface Metadata {
  [key: string]: string;
}

export interface MultipartUploadOptions {
  partSize?: number;
  queueSize?: number;
  metadata?: Metadata;
}

export interface ObjectDirectory {
  /** Container for Azure. First directory of a prefix for S3. */
  baseDirectory: string;
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
