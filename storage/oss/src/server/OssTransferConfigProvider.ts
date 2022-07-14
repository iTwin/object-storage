/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";
import { inject, injectable } from "inversify";

import { buildObjectDirectoryString } from "@itwin/object-storage-core/lib/common/internal";
import { getRandomString } from "@itwin/object-storage-core/lib/server/internal";

import {
  ObjectDirectory,
  TransferConfigProvider,
} from "@itwin/object-storage-core";
import {
  S3ServerStorageConfig,
  S3TransferConfig,
  Types,
} from "@itwin/object-storage-s3";

@injectable()
export class OssTransferConfigProvider implements TransferConfigProvider {
  private readonly _config: S3ServerStorageConfig;
  private readonly _client: Core;

  public constructor(
    client: Core,
    @inject(Types.S3Server.config) config: S3ServerStorageConfig
  ) {
    this._config = config;
    this._client = client;
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    expiresInSeconds = 3600
  ): Promise<S3TransferConfig> {
    /* eslint-disable @typescript-eslint/naming-convention */
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
        DurationSeconds: expiresInSeconds,
      },
      {
        method: "POST",
      }
    );
    /* eslint-enable @typescript-eslint/naming-convention */

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
    };
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    expiresInSeconds = 3600
  ): Promise<S3TransferConfig> {
    /* eslint-disable @typescript-eslint/naming-convention */
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
        DurationSeconds: expiresInSeconds,
      },
      {
        method: "POST",
      }
    );
    /* eslint-enable @typescript-eslint/naming-convention */

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
    };
  }
}

/* eslint-disable @typescript-eslint/naming-convention */
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
/* eslint-enable @typescript-eslint/naming-convention */
