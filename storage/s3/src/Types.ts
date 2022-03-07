/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  bucket: Symbol.for("Types.Bucket"),
  S3Server: {
    config: Symbol.for("Types.S3Server.Config"),
  },
  S3Client: {
    config: Symbol.for("Types.S3Client.Config"),
  },
};

export { types as Types };
