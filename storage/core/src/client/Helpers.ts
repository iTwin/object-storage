/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { UrlDownloadInput, UrlUploadInput } from "./ClientInterfaces";

export function instanceOfUrlDownloadInput(
  input: unknown
): input is UrlDownloadInput {
  return "url" in (input as UrlDownloadInput);
}

export function instanceOfUrlUploadInput(
  input: unknown
): input is UrlUploadInput {
  return "url" in (input as UrlUploadInput);
}
