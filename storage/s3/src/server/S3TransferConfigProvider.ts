/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomUUID } from "crypto";

import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";
import { inject, injectable } from "inversify";

import {
  buildObjectDirectoryString,
  ObjectDirectory,
  TransferConfigProvider,
} from "@itwin/object-storage-core";

import { S3TransferConfig } from "../frontend";
import { S3ServerStorageConfig } from "./S3ServerStorage";
import { Types } from "../Types";

@injectable()
export class S3TransferConfigProvider implements TransferConfigProvider {
  private readonly _config: S3ServerStorageConfig;
  private readonly _client: STSClient;

  public constructor(
    client: STSClient,
    @inject(Types.S3Server.config) config: S3ServerStorageConfig
  ) {
    this._config = config;
    this._client = client;
  }

  public async getDownloadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
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
        DurationSeconds: expiresInSeconds,
        Policy: JSON.stringify(policy),
        RoleArn: this._config.roleArn,
        RoleSessionName: randomUUID(),
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
    };
  }

  public async getUploadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
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
        DurationSeconds: expiresInSeconds,
        Policy: JSON.stringify(policy),
        RoleArn: this._config.roleArn,
        RoleSessionName: randomUUID(),
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
    };
  }
}