/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
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
