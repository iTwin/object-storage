/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ObjectDirectory,
  ObjectReference,
  PresignedUrlProvider,
  TransferConfigProvider,
} from "@itwin/object-storage-core";

export const mockPresignedUrlProvider: PresignedUrlProvider = {
  getDownloadUrl: (_reference: ObjectReference, _expiresInSeconds?: number) => {
    throw new Error("Not implemented.");
  },
  getUploadUrl: (_reference: ObjectReference, _expiresInSeconds?: number) => {
    throw new Error("Not implemented.");
  },
};

export const mockTransferConfigProvider: TransferConfigProvider = {
  getDownloadConfig: (
    _directory: ObjectDirectory,
    _expiresInSeconds?: number
  ) => {
    throw new Error("Not implemented.");
  },
  getUploadConfig: (
    _directory: ObjectDirectory,
    _expiresInSeconds?: number
  ) => {
    throw new Error("Not implemented.");
  },
};
