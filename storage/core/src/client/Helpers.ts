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

export function instanceOfUrlInput(
  input: unknown
): input is
  | UrlDownloadInput
  // | UrlDownloadInput // TODO
  | UrlUploadInput
// | UrlUploadInput
{
  // TODO: very many assertions that to the same
  return "url" in (input as any); // TODO: ANY
}