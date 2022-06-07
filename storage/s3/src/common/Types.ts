/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const types = {
  bucket: Symbol.for("Types.Bucket"),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  S3Server: {
    config: Symbol.for("Types.S3Server.Config"),
  },
};

export { types as Types };
