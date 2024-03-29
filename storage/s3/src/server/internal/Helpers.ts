/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { defaultExpiresInSeconds } from "@itwin/object-storage-core/lib/common/internal";

import { ExpiryOptions } from "@itwin/object-storage-core";

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

export function getExpiresInSeconds(options?: ExpiryOptions): number {
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- false positive
  return defaultExpiresInSeconds; // expires in one hour by default
}

export function getActions(): string[] {
  const actions: string[] = [
    "s3:GetObject",
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:ListBucket",
  ];

  return actions;
}
