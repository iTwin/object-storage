/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  assertInstanceType,
  assertPrimitiveType,
} from "@itwin/cloud-agnostic-core";

import {
  Metadata,
  ObjectDirectory,
  ObjectReference,
  TransferConfig,
  UrlTransferInput,
} from "./Interfaces";

export function metadataToHeaders(
  metadata: Metadata,
  prefix: string
): Record<string, string> {
  return Object.keys(metadata).reduce(
    (acc: Record<string, string>, suffix: string) => ({
      ...acc,
      [`${prefix}${suffix}`.toLowerCase()]: metadata[suffix],
    }),
    {}
  );
}

export function buildObjectKey(ref: ObjectReference): string {
  const relative = ref.relativeDirectory ? `/${ref.relativeDirectory}` : "";
  return `${ref.baseDirectory}${relative}/${ref.objectName}`;
}
export function buildObjectReference(
  objectKey: string,
  separator = "/"
): ObjectReference {
  const parts = objectKey.split(separator).filter((key) => key);
  const lastIndex = parts.length - 1;

  const result: ObjectReference = {
    baseDirectory: parts[0],
    objectName: parts.length !== 1 ? parts[lastIndex] : "",
  };

  const relativeDirectory = parts.slice(1, lastIndex).join("/");
  if (relativeDirectory) result.relativeDirectory = relativeDirectory;

  return result;
}
export function buildObjectDirectoryString(directory: ObjectDirectory): string {
  const { baseDirectory, relativeDirectory } = directory;
  return `${baseDirectory}${relativeDirectory ? `/${relativeDirectory}` : ""}`;
}

export function assertRelativeDirectory(
  relativeDirectory: string | undefined
): void {
  if (!relativeDirectory) return;

  const backslash = "\\";
  if (relativeDirectory.includes(backslash))
    throw new Error("Relative directory cannot contain backslashes.");

  const separator = "/";
  if (
    relativeDirectory[0] === separator ||
    relativeDirectory[relativeDirectory.length - 1] === separator
  )
    throw new Error(
      "Relative directory cannot contain slashes at the beginning or the end of the string."
    );
}
export function assertTransferConfig(transferConfig: TransferConfig): void {
  assertPrimitiveType(transferConfig, "transferConfig", "object");
  assertPrimitiveType(
    transferConfig.baseUrl,
    "transferConfig.baseUrl",
    "string"
  );
  assertInstanceType(
    transferConfig.expiration,
    "transferConfig.expiration",
    Date
  );
  if (new Date() > transferConfig.expiration)
    throw new Error("Transfer config is expired");
}
export function instanceOfUrlTransferInput(
  input: unknown
): input is UrlTransferInput {
  return "url" in (input as UrlTransferInput);
}

interface GetTransferTimeInSecondsOptions {
  maxTransferTime?: number;
  minTransferSpeedInKbps?: number;
  padding?: number;
}
export function getTransferTimeInSeconds(
  fileSize: number,
  {
    maxTransferTime = 3600,
    minTransferSpeedInKbps = 100,
    padding = 300,
  }: GetTransferTimeInSecondsOptions = {}
): number {
  const bytesPerSecond = minTransferSpeedInKbps * 125;
  const seconds = fileSize / bytesPerSecond + padding;
  return seconds > maxTransferTime ? maxTransferTime : seconds;
}
