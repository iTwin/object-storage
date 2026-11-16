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

export interface RetryOptions {
  /** Maximum number of retry attempts. */
  maxRetries?: number;
  /**
   * Initial delay in milliseconds before the first retry, with exponential
   * backoff applied on subsequent attempts.
   * Supported by Azure server storage and all URL-based client transfers.
   * Ignored by S3, Minio, and Google storage.
   */
  retryDelayMs?: number;
  /**
   * Upper bound in milliseconds for the delay between retries.
   * Supported by Azure and Google storage, and all URL-based client transfers.
   * Ignored by S3 and Minio server storage.
   */
  maxRetryDelayMs?: number;
}

export interface StorageOptions {
  retryOptions?: RetryOptions;
}

/** Upload progress reported to {@link TransferProgressCallback}. */
export interface TransferProgress {
  /**
   * Bytes sent so far in the current attempt.
   */
  loadedBytes: number;
  /**
   * Total upload size, when known (`Buffer` length or local file size).
   * `undefined` for streams of unknown size.
   */
  totalBytes?: number;
}

/**
 * Called as upload data is sent. Completion is signalled by the upload
 * promise resolving, not by a progress event.
 *
 * @note How often it is called depends on the storage and the upload method. Some
 * uploads report once per uploaded part or block (5 MiB or more), so data
 * smaller than one part may be reported in a single event. A `Buffer` uploaded
 * to Azure or Google may be reported once, with its full size, before it is
 * sent.
 * @note Exceptions thrown by the callback are caught and ignored.
 */
export type TransferProgressCallback = (progress: TransferProgress) => void;
