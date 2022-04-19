/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  Client: {
    clientWrapperFactory: Symbol.for("Types.Client.clientWrapperFactory"),
  },
  Frontend: {
    clientWrapperFactory: Symbol.for("Types.Frontend.clientWrapperFactory"),
  },
  Server: {
    presignedUrlProvider: Symbol.for("Types.Server.PresignedUrlProvider"),
    transferConfigProvider: Symbol.for("Types.Server.TransferConfigProvider"),
  },
};

export { types as Types };
