/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { randomUUID } from "crypto";

import * as Core from "@alicloud/pop-core";
import { inject, injectable } from "inversify";

import {
  buildObjectDirectoryString,
  ObjectDirectory,
  TransferConfig,
  TransferConfigProvider,
} from "@itwin/object-storage-core";
import { S3ServerSideStorageConfig, Types } from "@itwin/object-storage-s3";

@injectable()
export class OssTransferConfigProvider implements TransferConfigProvider {
  private readonly _config: S3ServerSideStorageConfig;
  private readonly _client: Core;

  public constructor(
    client: Core,
    @inject(Types.S3ServerSide.config) config: S3ServerSideStorageConfig
  ) {
    this._config = config;
    this._client = client;
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    expiresInSeconds = 3600
  ): Promise<TransferConfig> {
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
        RoleSessionName: randomUUID(),
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
    };
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    expiresInSeconds = 3600
  ): Promise<TransferConfig> {
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
        RoleSessionName: randomUUID(),
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
