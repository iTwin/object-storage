/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  Server: {
    presignedUrlProvider: Symbol.for("Types.Server.PresignedUrlProvider"),
    transferConfigProvider: Symbol.for("Types.Server.TransferConfigProvider"),
  },
};

export { types as Types };
