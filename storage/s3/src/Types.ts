/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  bucket: Symbol.for("Types.Bucket"),
  S3Client: {
    s3ClientWrapperFactory: Symbol.for("Types.S3Client.S3ClientWrapperFactory"),
  },
  S3Frontend: {
    config: Symbol.for("Types.S3Frontend.Config"),
    s3ClientWrapperFactory: Symbol.for(
      "Types.S3Frontend.S3ClientWrapperFactory"
    ),
  },
  S3Server: {
    config: Symbol.for("Types.S3Server.Config"),
  },
};

export { types as Types };
