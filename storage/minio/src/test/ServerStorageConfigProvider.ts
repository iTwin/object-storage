/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3ServerStorageConfig } from "@itwin/object-storage-s3";

export class ServerStorageConfigProvider {
  public get(): S3ServerStorageConfig {
    const config: S3ServerStorageConfig = {
      bucket: "integration-test",
      // cspell:disable-next-line
      accessKey: "minioadmin",
      // cspell:disable-next-line
      secretKey: "minioadmin",
      baseUrl: "http://127.0.0.1:9000",
      region: "us-east-1",
      roleArn: "<role-arn>",
      stsBaseUrl: "http://127.0.0.1:9000",
    };
    return config;
  }
}
