/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3ClientWrapper } from "../wrappers";

export async function createAndUseClient<TResult>(
  clientFactory: () => S3ClientWrapper,
  method: (clientWrapper: S3ClientWrapper) => Promise<TResult>
): Promise<TResult> {
  const clientWrapper = clientFactory();

  try {
    return await method(clientWrapper);
  } finally {
    clientWrapper.releaseResources();
  }
}

export function getExpiresIn(options?: {
  expiresInSeconds?: number;
  expiresOn?: Date;
}): number {
  if (options?.expiresInSeconds && options?.expiresOn) {
    throw new Error(
      "Only one of 'expiresInSeconds' and 'expiresOn' can be specified."
    );
  }
  if (options?.expiresInSeconds) {
    return Math.floor(options.expiresInSeconds);
  }
  if (options?.expiresOn) {
    return Math.floor((options.expiresOn.getTime() - Date.now()) / 1000);
  }
  return 60 * 60; // expires in one hour by default
}
