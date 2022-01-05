/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Readable } from "stream";

export type TransferType = "buffer" | "stream" | "local";
export type TransferData = Buffer | Readable | string;

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
  protocol: "http" | "https";
  hostname: string;
  authentication: string | TemporaryS3Credentials;
  expiration: Date;
}

export interface S3Credentials {
  accessKey: string;
  secretKey: string;
}

export interface TemporaryS3Credentials extends S3Credentials {
  sessionToken: string;
}

export interface ObjectProperties {
  reference: ObjectReference;
  size: number;
  lastModified: Date;
  metadata?: Metadata;
}
