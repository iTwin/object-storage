/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendTransferData } from "@itwin/object-storage-core/lib/frontend";
import { streamToBufferFrontend } from "@itwin/object-storage-core/lib/frontend/internal";

export function arrayBufferToReadableStream(
  buffer: ArrayBuffer
): ReadableStream {
  return new Response(buffer).body!;
}
export function stringToArrayBuffer(input: string): ArrayBuffer {
  return new TextEncoder().encode(input).buffer;
}
export function stringToReadableStream(input: string): ReadableStream {
  return arrayBufferToReadableStream(stringToArrayBuffer(input));
}

export function arrayBufferEquals(x: ArrayBuffer, y: ArrayBuffer): boolean {
  if (x.byteLength !== y.byteLength) return false;

  const xView = new DataView(x);
  const yView = new DataView(y);

  for (let i = x.byteLength - 1; i >= 0; i--) {
    if (xView.getUint8(i) !== yView.getUint8(i)) return false;
  }
  return true;
}

export function assertArrayBuffer(
  got: FrontendTransferData,
  expected: ArrayBuffer
): void {
  expect(
    got instanceof ArrayBuffer,
    `Not an ArrayBuffer: ${got.constructor.name}`
  ).to.be.true;
  expect(arrayBufferEquals(got as ArrayBuffer, expected), "got != expected").to
    .be.true;
}

export async function assertReadableStream(
  got: FrontendTransferData,
  expectedAsBuffer: ArrayBuffer
): Promise<void> {
  expect(
    got instanceof ReadableStream,
    `Not a ReadableStream: ${got.constructor.name}`
  ).to.be.true;
  const gotBuffer = await streamToBufferFrontend(got as ReadableStream);
  expect(arrayBufferEquals(gotBuffer, expectedAsBuffer), "got != expected").to
    .be.true;
}
