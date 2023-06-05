/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject } from "inversify";

import {
  Types as CoreTypes,
  ObjectReference,
  PresignedUrlProvider,
  TransferConfigProvider,
} from "@itwin/object-storage-core";
import {
  S3ClientWrapper,
  S3ServerStorage,
  S3ServerStorageConfig,
} from "@itwin/object-storage-s3";

import { Types } from "../common/Types";

export interface MinioServerStorageConfig extends S3ServerStorageConfig {
  symbolsMap?: { [key: string]: string };
}

export class MinioServerStorage extends S3ServerStorage {
  private readonly _config: MinioServerStorageConfig;

  public constructor(
    s3Client: S3ClientWrapper,
    @inject(CoreTypes.Server.presignedUrlProvider)
    presignedUrlProvider: PresignedUrlProvider,
    @inject(CoreTypes.Server.transferConfigProvider)
    transferConfigProvider: TransferConfigProvider,
    @inject(Types.MinioServer.config)
    config: MinioServerStorageConfig
  ) {
    super(s3Client, presignedUrlProvider, transferConfigProvider);
    this._config = config;
  }

  public override async deleteObject(
    reference: ObjectReference
  ): Promise<void> {
    await super.deleteObject(reference);

    if (!(await this.baseDirectoryExists(reference)))
      await this.createBaseDirectory(reference);
  }

  private replaceSymbols(textToReplace: string) {
    const { symbolsMap } = this._config;
    let result = textToReplace;
    for (const key in symbolsMap) {
      if (symbolsMap.hasOwnProperty(key))
        result = result.replace(new RegExp(key, "g"), symbolsMap[key]);
    }
    return result;
  }

  private async replaceReferenceSymbols(
    reference: ObjectReference
  ): Promise<ObjectReference> {
    const result = reference;
    result.baseDirectory = this.replaceSymbols(reference.baseDirectory);
    result.objectName = this.replaceSymbols(reference.objectName);
    if (reference.relativeDirectory)
      result.relativeDirectory = this.replaceSymbols(
        reference.relativeDirectory
      );
    return result;
  }

  public override async getUploadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string> {
    return super.getUploadUrl(
      await this.replaceReferenceSymbols(reference),
      expiresInSeconds
    );
  }
}
