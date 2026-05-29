/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  AzureServer: {
    config: Symbol.for("Types.AzureServer.Config"),
  },
  AzureClient: {
    config: Symbol.for("Types.AzureClient.Config"),
  },
};

export { types as Types };
