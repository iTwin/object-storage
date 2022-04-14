/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  bucket: Symbol.for("Types.Bucket"),
  S3Client: {
    config: Symbol.for("Types.S3Client.Config"),
  },
  S3Server: {
    config: Symbol.for("Types.S3Server.Config"),
  },
};

export { types as Types };
