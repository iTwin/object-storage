/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { ConfigTransferInput, UrlTransferInput } from "./Interfaces";

export function isUrlTransferInput(
  input: UrlTransferInput | ConfigTransferInput
): input is UrlTransferInput {
  return (
    (input as UrlTransferInput).url != null &&
    (input as UrlTransferInput).storageType != null
  );
}

export function inputToStorageType(
  input: UrlTransferInput | ConfigTransferInput
): string {
  if (isUrlTransferInput(input)) {
    return input.storageType;
  }
  return input.transferConfig.storageType;
}
