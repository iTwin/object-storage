/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  Server: {
    presignedUrlProvider: Symbol.for("Types.Server.PresignedUrlProvider"),
    transferConfigProvider: Symbol.for("Types.Server.TransferConfigProvider"),
  },
};

export { types as Types };
