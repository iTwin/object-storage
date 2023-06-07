/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BaseDirectory,
  Metadata,
  ObjectDirectory,
  ObjectReference,
} from "@itwin/object-storage-core";

const BASE_PATH = "/storage";

export const DOWNLOAD_REQUEST_PATH = `${BASE_PATH}/download`;
export interface DownloadRequest {
  reference: ObjectReference;
}

export const UPLOAD_REQUEST_PATH = `${BASE_PATH}/upload`;
export interface UploadRequest {
  reference: ObjectReference;
  data: string;
  metadata?: Metadata;
}

export const CREATE_BASE_DIRECTORY_REQUEST_PATH = `${BASE_PATH}/createBaseDirectory`;
export interface CreateBaseDirectoryRequest {
  directory: BaseDirectory;
}

export const DELETE_BASE_DIRECTORY_REQUEST_PATH = `${BASE_PATH}/deleteBaseDirectory`;
export interface DeleteBaseDirectoryRequest {
  directory: BaseDirectory;
}

export const DELETE_OBJECT_REQUEST_PATH = `${BASE_PATH}/deleteObjectRequestPath`;
export interface DeleteObjectRequest {
  reference: ObjectReference;
}

export const BASE_DIRECTORY_EXISTS_REQUEST_PATH = `${BASE_PATH}/baseDirectoryExists`;
export interface BaseDirectoryExistsRequest {
  directory: BaseDirectory;
}

export const OBJECT_EXISTS_REQUEST_PATH = `${BASE_PATH}/objectExists`;
export interface ObjectExistsRequest {
  reference: ObjectReference;
}

export const GET_OBJECT_PROPERTIES_REQUEST_PATH = `${BASE_PATH}/getObjectProperties`;
export interface GetObjectPropertiesRequest {
  reference: ObjectReference;
}

export const GET_DOWNLOAD_URL_REQUEST_PATH = `${BASE_PATH}/getDownloadUrl`;
export interface GetDownloadUrlRequest {
  reference: ObjectReference;
  options?: {
    expiresInSeconds?: number;
    expiresOn?: Date;
  };
}

export const GET_UPLOAD_URL_REQUEST_PATH = `${BASE_PATH}/getUploadUrl`;
export interface GetUploadUrlRequest {
  reference: ObjectReference;
  options?: {
    expiresInSeconds?: number;
    expiresOn?: Date;
  };
}

export const GET_DOWNLOAD_CONFIG_REQUEST_PATH = `${BASE_PATH}/getDownloadConfig`;
export interface GetDownloadConfigRequest {
  directory: ObjectDirectory;
  options?: {
    expiresInSeconds?: number;
    expiresOn?: Date;
  };
}

export const GET_UPLOAD_CONFIG_REQUEST_PATH = `${BASE_PATH}/getUploadConfig`;
export interface GetUploadConfigRequest {
  directory: ObjectDirectory;
  options?: {
    expiresInSeconds?: number;
    expiresOn?: Date;
  };
}
