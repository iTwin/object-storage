/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3ClientWrapper } from "../server/wrappers/S3ClientWrapper";

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
