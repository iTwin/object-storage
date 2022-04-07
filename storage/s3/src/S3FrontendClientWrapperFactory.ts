/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";

import { FrontendS3ClientWrapper } from "./FrontendS3ClientWrapper";
import { S3ClientStorageConfig } from "./S3ClientStorageConfig";
import { S3ClientWrapperFactoryBase } from "./S3ClientWrapperFactoryBase";
import { Types } from "./Types";

@injectable()
export class S3FrontendClientWrapperFactory extends S3ClientWrapperFactoryBase<FrontendS3ClientWrapper> {
  public constructor(
    @inject(Types.S3Server.config) config: S3ClientStorageConfig
  ) {
    super(FrontendS3ClientWrapper, config);
  }
}
