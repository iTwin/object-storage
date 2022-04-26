/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";

import * as dotenv from "dotenv";

import { AzureServerStorageConfig } from "../../server";

export class TestAzureServerStorageConfig {
  public get(): AzureServerStorageConfig {
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

    const config: AzureServerStorageConfig = {
      accountName: process.env.TEST_AZURE_STORAGE_ACCOUNT_NAME!,
      accountKey: process.env.TEST_AZURE_STORAGE_ACCOUNT_KEY!,
      baseUrl: process.env.TEST_AZURE_STORAGE_BASE_URL!,
    };

    return config;
  }
}
