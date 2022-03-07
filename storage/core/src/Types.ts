/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
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
