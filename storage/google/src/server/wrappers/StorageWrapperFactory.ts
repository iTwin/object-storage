/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Storage } from "@google-cloud/storage";
import { injectable } from "inversify";

import { GoogleTransferConfig } from "../../common/Interfaces";

import { GoogleStorageConfig } from "./GoogleStorageConfig";
import { StorageWrapper } from "./StorageWrapper";

@injectable()
export class StorageWrapperFactory {
  public createDefaultApplication(config: GoogleStorageConfig): StorageWrapper {
    return new StorageWrapper(
      new Storage({ projectId: config.projectId }),
      config
    );
  }

  public createFromToken(transferConfig: GoogleTransferConfig): StorageWrapper {
    return new StorageWrapper(
      new Storage({
        token: transferConfig.authentication,
      }),
      { bucketName: transferConfig.bucketName }
    );
  }
}
