/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  bucket: Symbol.for("Types.Bucket"),
  S3ServerSide: {
    config: Symbol.for("Types.S3ServerSide.Config"),
  },
  S3ClientSide: {
    config: Symbol.for("Types.S3ClientSide.Config"),
  },
};

export { types as Types };
