/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";
import * as dotenv from "dotenv";
import { S3ServerStorageConfig } from "@itwin/object-storage-s3";

export class ServerStorageConfigProvider {
  public get(): S3ServerStorageConfig {
    const envFilePath = path.resolve(
      __dirname,
      "..",
      "..",
      "src",
      "test",
      ".env"
    );
    dotenv.config({ path: envFilePath });

    const config: S3ServerStorageConfig = {
      bucket: process.env.TEST_OSS_BUCKET!,
      accessKey: process.env.TEST_OSS_ACCESS_KEY!,
      secretKey: process.env.TEST_OSS_SECRET_KEY!,
      baseUrl: process.env.TEST_OSS_BASE_URL!,
      region: process.env.TEST_OSS_REGION!,
      roleArn: process.env.TEST_OSS_ROLE_ARN!,
      stsBaseUrl: process.env.TEST_OSS_STS_BASE_URL!,
    };
    return config;
  }
}