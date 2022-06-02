import { FrontendTransferData, streamToBufferFrontend } from "@itwin/object-storage-core";

export function arrayBufferEquals(x: ArrayBuffer, y: ArrayBuffer): boolean {
  if(x.byteLength !== y.byteLength)
    return false;

  const xView = new DataView(x);
  const yView = new DataView(y);
  
  for(var i = x.byteLength - 1; i >= 0; i--) {
    if(xView.getUint8(i) !== yView.getUint8(i))
      return false;
  }
  return true;
}

export function assertArrayBuffer(got: FrontendTransferData, expected: ArrayBuffer): void {
  expect(got instanceof ArrayBuffer).to.be.true;
  expect(arrayBufferEquals(got as ArrayBuffer, expected)).to.be.true;
}

export async function assertReadableStream(
  got: FrontendTransferData,
  expectedAsBuffer: ArrayBuffer
): Promise<void> {
  expect(got instanceof ReadableStream).to.be.true;
  const gotBuffer = await streamToBufferFrontend(got as ReadableStream);
  expect(arrayBufferEquals(gotBuffer, expectedAsBuffer)).to.be.true;
}