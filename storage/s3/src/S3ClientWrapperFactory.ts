/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";

import { S3ClientStorageConfig } from "./S3ClientStorageConfig";
import { S3ClientWrapper } from "./S3ClientWrapper";
import { S3ClientWrapperFactoryBase } from "./S3ClientWrapperFactoryBase";
import { Types } from "./Types";

@injectable()
export class S3ClientWrapperFactory extends S3ClientWrapperFactoryBase<S3ClientWrapper> {
  public constructor(
    @inject(Types.S3Server.config) config: S3ClientStorageConfig
  ) {
    super(S3ClientWrapper, config);
  }
}
