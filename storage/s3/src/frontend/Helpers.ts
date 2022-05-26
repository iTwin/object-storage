/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3ClientWrapperFrontend } from "./wrappers";

export async function createAndUseClientFrontend<TResult>(
  clientFactory: () => S3ClientWrapperFrontend,
  method: (clientWrapper: S3ClientWrapperFrontend) => Promise<TResult>
): Promise<TResult> {
  const clientWrapper = clientFactory();

  try {
    return await method(clientWrapper);
  } finally {
    clientWrapper.releaseResources();
  }
}
