/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";
import { inject, injectable } from "inversify";

import { buildObjectDirectoryString } from "@itwin/object-storage-core/lib/common/internal";
import { getRandomString } from "@itwin/object-storage-core/lib/server/internal";

import {
  ExpiryOptions,
  ObjectDirectory,
  Permissions,
  TransferConfigProvider,
} from "@itwin/object-storage-core";

import { S3TransferConfig, Types } from "../common";

import { getActionsFromPermissions, getExpiresInSeconds } from "./internal";
import { S3ServerStorageConfig } from "./S3ServerStorage";

@injectable()
export class S3TransferConfigProvider implements TransferConfigProvider {
  private readonly _config: S3ServerStorageConfig;
  private readonly _client: STSClient;

  public constructor(
    client: STSClient,
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    @inject(Types.S3Server.config) config: S3ServerStorageConfig
  ) {
    this._config = config;
    this._client = client;
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    options?: ExpiryOptions
  ): Promise<S3TransferConfig> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["s3:GetObject"],
          Resource: [
            `arn:aws:s3:::${this._config.bucket}/${buildObjectDirectoryString(
              directory
            )}/*`,
          ],
        },
      ],
    };

    const { Credentials } = await this._client.send(
      new AssumeRoleCommand({
        DurationSeconds: getExpiresInSeconds(options),
        Policy: JSON.stringify(policy),
        RoleArn: this._config.roleArn,
        RoleSessionName: getRandomString(),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    return {
      authentication: {
        accessKey: Credentials!.AccessKeyId!,
        secretKey: Credentials!.SecretAccessKey!,
        sessionToken: Credentials!.SessionToken!,
      },
      expiration: Credentials!.Expiration!,
      baseUrl: this._config.baseUrl,
      region: this._config.region,
      bucket: this._config.bucket,
    };
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    options?: ExpiryOptions
  ): Promise<S3TransferConfig> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["s3:PutObject"],
          Resource: [
            `arn:aws:s3:::${this._config.bucket}/${buildObjectDirectoryString(
              directory
            )}/*`,
          ],
        },
      ],
    };

    const { Credentials } = await this._client.send(
      new AssumeRoleCommand({
        DurationSeconds: getExpiresInSeconds(options),
        Policy: JSON.stringify(policy),
        RoleArn: this._config.roleArn,
        RoleSessionName: getRandomString(),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    return {
      authentication: {
        accessKey: Credentials!.AccessKeyId!,
        secretKey: Credentials!.SecretAccessKey!,
        sessionToken: Credentials!.SessionToken!,
      },
      expiration: Credentials!.Expiration!,
      baseUrl: this._config.baseUrl,
      region: this._config.region,
      bucket: this._config.bucket,
    };
  }

  public async getDirectoryAccessConfig(
    directory: ObjectDirectory,
    permissions?: Permissions,
    options?: ExpiryOptions
  ): Promise<S3TransferConfig> {
    const actions = getActionsFromPermissions(permissions);
    /* eslint-disable @typescript-eslint/naming-convention */
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: actions,
          Resource: [
            `arn:aws:s3:::${this._config.bucket}/${buildObjectDirectoryString(
              directory
            )}/*`,
          ],
        },
      ],
    };

    const { Credentials } = await this._client.send(
      new AssumeRoleCommand({
        DurationSeconds: getExpiresInSeconds(options),
        Policy: JSON.stringify(policy),
        RoleArn: this._config.roleArn,
        RoleSessionName: getRandomString(),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    return {
      authentication: {
        accessKey: Credentials!.AccessKeyId!,
        secretKey: Credentials!.SecretAccessKey!,
        sessionToken: Credentials!.SessionToken!,
      },
      expiration: Credentials!.Expiration!,
      baseUrl: this._config.baseUrl,
      region: this._config.region,
      bucket: this._config.bucket,
    };
  }
}
