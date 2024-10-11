/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";

import * as dotenv from "dotenv";

import { GoogleStorageConfig } from "../../server/wrappers";

export interface SecondaryBucket {
  secondaryBucketName: string;
}

export class ServerStorageConfigProvider {
  public get(): GoogleStorageConfig & SecondaryBucket {
    const envFilePath = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "src",
      "test",
      "integration",
      ".env"
    );
    dotenv.config({ path: envFilePath });

    const config: GoogleStorageConfig & SecondaryBucket = {
      bucketName: process.env.TEST_GOOGLE_BUCKET_NAME!,
      projectId: process.env.TEST_GOOGLE_PROJECT_ID!,
      secondaryBucketName: process.env.TEST_SECONDARY_GOOGLE_BUCKET_NAME!,
    };
    return config;
  }
}
