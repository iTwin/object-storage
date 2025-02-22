/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
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

export interface ContentHeaders {
  contentEncoding?: string;
  cacheControl?: string;
  contentType?: string;
}

export type ObjectProperties = ContentHeaders & {
  reference: ObjectReference;
  size: number;
  lastModified: Date;
  metadata?: Metadata;
};

export interface TransferConfig {
  baseUrl: string;
  expiration: Date;
  storageType: string;
}

export interface UrlTransferInput {
  url: string;
  storageType: string;
}

export interface ConfigTransferInput {
  reference: ObjectReference;
  transferConfig: TransferConfig;
}
