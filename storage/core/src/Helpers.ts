/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import { Readable } from "stream";

import { ObjectDirectory, ObjectReference } from "./StorageInterfaces";

export async function streamToLocalFile(
  stream: Readable,
  destinationPath: string
): Promise<void> {
  await mkdir(dirname(destinationPath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const fileStream = createWriteStream(destinationPath);
    stream.pipe(fileStream);
    stream.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const buffer = Array<Uint8Array>();
    stream.on("data", (chunk) => buffer.push(chunk as Uint8Array));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(buffer)));
  });
}

export function buildObjectKey(reference: {
  baseDirectory: string;
  relativeDirectory?: string;
  objectName: string;
}): string {
  const { baseDirectory, relativeDirectory, objectName } = reference;
  return `${baseDirectory}${
    relativeDirectory ? `/${relativeDirectory}` : ""
  }/${objectName}`;
}

export function buildObjectReference(objectKey: string): ObjectReference {
  const parts = objectKey.split("/");
  const lastIndex = parts.length - 1;

  return {
    baseDirectory: parts[0],
    relativeDirectory: parts.slice(1, lastIndex).join("/"),
    objectName: parts[lastIndex],
  };
}

export function buildObjectDirectoryString(directory: ObjectDirectory): string {
  const { baseDirectory, relativeDirectory } = directory;
  return `${baseDirectory}${relativeDirectory ? `/${relativeDirectory}` : ""}`;
}
