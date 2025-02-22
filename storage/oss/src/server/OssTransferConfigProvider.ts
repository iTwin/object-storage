/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";

import { buildObjectDirectoryString } from "@itwin/object-storage-core/lib/common/internal";
import { getRandomString } from "@itwin/object-storage-core/lib/server/internal";
import { getExpiresInSeconds } from "@itwin/object-storage-s3/lib/server/internal";

import {
  ExpiryOptions,
  ObjectDirectory,
  TransferConfigProvider,
} from "@itwin/object-storage-core";
import {
  S3ServerStorageConfig,
  S3TransferConfig,
} from "@itwin/object-storage-s3";

import { Constants } from "../common";

import { getActions } from "./internal";

export class OssTransferConfigProvider implements TransferConfigProvider {
  private readonly _config: S3ServerStorageConfig;
  private readonly _client: Core;

  public constructor(client: Core, config: S3ServerStorageConfig) {
    this._config = config;
    this._client = client;
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<S3TransferConfig> {
    const policy = {
      Version: "1",
      Statement: [
        {
          Effect: "Allow",
          Action: ["oss:GetObject"],
          Resource: [
            `acs:oss:*:*:${this._config.bucket}/${buildObjectDirectoryString(
              directory
            )}/*`,
          ],
        },
      ],
    };

    const { Credentials } = await this._client.request<AssumeRoleResponse>(
      "AssumeRole",
      {
        RoleArn: this._config.roleArn,
        RoleSessionName: getRandomString(),
        Policy: JSON.stringify(policy),
        DurationSeconds: getExpiresInSeconds(expiry),
      },
      {
        method: "POST",
      }
    );

    return {
      authentication: {
        accessKey: Credentials.AccessKeyId,
        secretKey: Credentials.AccessKeySecret,
        sessionToken: Credentials.SecurityToken,
      },
      expiration: new Date(Credentials.Expiration),
      baseUrl: this._config.baseUrl,
      region: this._config.region,
      bucket: this._config.bucket,
      storageType: Constants.storageType,
    };
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<S3TransferConfig> {
    const policy = {
      Version: "1",
      Statement: [
        {
          Effect: "Allow",
          Action: ["oss:PutObject"],
          Resource: [
            `acs:oss:*:*:${this._config.bucket}/${buildObjectDirectoryString(
              directory
            )}/*`,
          ],
        },
      ],
    };

    const { Credentials } = await this._client.request<AssumeRoleResponse>(
      "AssumeRole",
      {
        RoleArn: this._config.roleArn,
        RoleSessionName: getRandomString(),
        Policy: JSON.stringify(policy),
        DurationSeconds: getExpiresInSeconds(expiry),
      },
      {
        method: "POST",
      }
    );

    return {
      authentication: {
        accessKey: Credentials.AccessKeyId,
        secretKey: Credentials.AccessKeySecret,
        sessionToken: Credentials.SecurityToken,
      },
      expiration: new Date(Credentials.Expiration),
      baseUrl: this._config.baseUrl,
      region: this._config.region,
      bucket: this._config.bucket,
      storageType: Constants.storageType,
    };
  }

  public async getDirectoryAccessConfig(
    directory: ObjectDirectory,
    expiry?: ExpiryOptions
  ): Promise<S3TransferConfig> {
    const actions = getActions();
    const policy = {
      Version: "1",
      Statement: [
        {
          Effect: "Allow",
          Action: actions,
          Resource: [
            `acs:oss:*:*:${this._config.bucket}/${buildObjectDirectoryString(
              directory
            )}/*`,
            `acs:oss:*:*:${this._config.bucket}`,
          ],
        },
      ],
    };

    const { Credentials } = await this._client.request<AssumeRoleResponse>(
      "AssumeRole",
      {
        RoleArn: this._config.roleArn,
        RoleSessionName: getRandomString(),
        Policy: JSON.stringify(policy),
        DurationSeconds: getExpiresInSeconds(expiry),
      },
      {
        method: "POST",
      }
    );

    return {
      authentication: {
        accessKey: Credentials.AccessKeyId,
        secretKey: Credentials.AccessKeySecret,
        sessionToken: Credentials.SecurityToken,
      },
      expiration: new Date(Credentials.Expiration),
      baseUrl: this._config.baseUrl,
      region: this._config.region,
      bucket: this._config.bucket,
      storageType: Constants.storageType,
    };
  }
}

interface AssumeRoleResponse {
  RequestId: string;
  AssumedRoleUser: {
    Arn: string;
    AssumedRoleId: string;
  };
  Credentials: {
    SecurityToken: string;
    AccessKeyId: string;
    AccessKeySecret: string;
    Expiration: string;
  };
}
