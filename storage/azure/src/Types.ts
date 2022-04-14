/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  AzureClient: {
    blockBlobClientWrapperFactory: Symbol.for(
      "Types.AzureClient.BlockBlobClientWrapperFactory"
    ),
  },
  AzureFrontend: {
    blockBlobClientWrapperFactory: Symbol.for(
      "Types.AzureFrontend.BlockBlobClientWrapperFactory"
    ),
  },
  AzureServer: {
    config: Symbol.for("Types.AzureServer.Config"),
  },
};

export { types as Types };
