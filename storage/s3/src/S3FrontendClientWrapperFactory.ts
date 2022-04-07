/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";
import { S3FrontendClientWrapper } from "./S3FrontendClientWrapper";
import { S3ClientStorageConfig } from "./S3ClientStorageConfig";
import { S3ClientWrapperFactoryBase } from "./S3ClientWrapperFactoryBase";
import { Types } from "./Types";

@injectable()
export class S3FrontendClientWrapperFactory extends S3ClientWrapperFactoryBase<S3FrontendClientWrapper> {
  public constructor(
    @inject(Types.S3Server.config) config: S3ClientStorageConfig
  ) {
    super(S3FrontendClientWrapper, config);
  }
}
