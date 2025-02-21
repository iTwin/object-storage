/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  Client: {
    clientWrapperFactory: Symbol.for("Types.Client.clientWrapperFactory"),
    clientStorage: Symbol.for("Types.Client.clientStorage"),
  },
  Frontend: {
    clientWrapperFactory: Symbol.for("Types.Frontend.clientWrapperFactory"),
    frontendStorage: Symbol.for("Types.Client.frontendStorage"),
  },
  Server: {
    presignedUrlProvider: Symbol.for("Types.Server.presignedUrlProvider"),
    transferConfigProvider: Symbol.for("Types.Server.transferConfigProvider"),
    serverStorage: Symbol.for("Types.Server.serverStorage"),
  },
};

export { types as Types };
