/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendTransferData, FrontendMultipartUploadData, FrontendUrlDownloadInput, FrontendUrlUploadInput, FrontendConfigDownloadInput, FrontendConfigUploadInput, FrontendUploadInMultiplePartsInput, FrontendTransferType } from "../frontend";

export type TransferType = FrontendTransferType | "local";
export type TransferData = FrontendTransferData | string;
export type MultipartUploadData = FrontendMultipartUploadData | string;

export interface UrlDownloadInput
  extends Omit<FrontendUrlDownloadInput, "transferType"> {
  transferType: TransferType;
  localPath?: string;
}

export interface UrlUploadInput extends Omit<FrontendUrlUploadInput, "data"> {
  data: TransferData;
}

export interface ConfigDownloadInput
  extends Omit<FrontendConfigDownloadInput, "transferType"> {
  transferType: TransferType;
}

export interface ConfigUploadInput
  extends Omit<FrontendConfigUploadInput, "data"> {
  data: TransferData;
}

export interface UploadInMultiplePartsInput
  extends Omit<FrontendUploadInMultiplePartsInput, "data"> {
  data: MultipartUploadData;
}
