/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  ServerSide: {
    presignedUrlProvider: Symbol.for("Types.ServerSide.PresignedUrlProvider"),
    transferConfigProvider: Symbol.for(
      "Types.ServerSide.TransferConfigProvider"
    ),
  },
};

export { types as Types };
