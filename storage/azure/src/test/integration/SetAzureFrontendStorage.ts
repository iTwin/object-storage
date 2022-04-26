/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  AzureFrontendStorage,
  BlockBlobClientWrapperFactory,
} from "../../frontend";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).frontendStorage = new AzureFrontendStorage(
  new BlockBlobClientWrapperFactory()
);
