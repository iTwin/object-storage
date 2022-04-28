/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject } from "inversify";

import { Types } from "../common";
import {
  S3FrontendClientWrapperFactory,
  S3FrontendStorageConfig,
} from "../frontend";

export class S3ClientWrapperFactory extends S3FrontendClientWrapperFactory {
  public constructor(
    @inject(Types.S3Client.config) config: S3FrontendStorageConfig
  ) {
    super(config);
  }
}
