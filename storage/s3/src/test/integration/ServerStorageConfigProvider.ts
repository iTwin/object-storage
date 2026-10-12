/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3ServerStorageConfig } from "../../server";

// Matches the local SeaweedFS server started by scripts/StartSeaweedFS.js,
// see scripts/SeaweedFSConstants.js.
export class ServerStorageConfigProvider {
  public get(): S3ServerStorageConfig {
    return {
      bucket: "integration-test",
      // cspell:disable-next-line
      accessKey: "integrationtestaccesskey",
      // cspell:disable-next-line
      secretKey: "integrationtestsecretkey",
      baseUrl: "http://127.0.0.1:8333",
      region: "us-east-1",
      roleArn: "arn:aws:iam::role/integration-test-role",
      stsBaseUrl: "http://127.0.0.1:8333",
    };
  }
}
