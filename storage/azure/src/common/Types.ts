/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const types = {
  AzureServer: {
    config: Symbol.for("Types.AzureServer.Config"),
  },
  Client: {
    blobClientWrapperFactory: Symbol.for(
      "Types.Client.blobClientWrapperFactory"
    ),
    blockBlobClientWrapperFactory: Symbol.for(
      "Types.Client.blockBlobClientWrapperFactory"
    ),
    containerClientWrapperFactory: Symbol.for(
      "Types.Client.containerClientWrapperFactory"
    ),
  },
};

export { types as Types };
