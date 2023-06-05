/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { MinioServerStorageConfig } from "../../server";

export class ServerStorageConfigProvider {
  public get(): MinioServerStorageConfig {
    const config: MinioServerStorageConfig = {
      bucket: "integration-test",
      // cspell:disable-next-line
      accessKey: "minioadmin",
      // cspell:disable-next-line
      secretKey: "minioadmin",
      baseUrl: "http://127.0.0.1:9000",
      region: "us-east-1",
      roleArn: "<role-arn>",
      stsBaseUrl: "http://127.0.0.1:9000",
      symbolsMap: {
        ":": "_",
        "/": "_",
        "<": "_",
        ">": "_",
        '"': "_",
      },
    };
    return config;
  }
}
