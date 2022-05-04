/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";

export function createCore(config: {
  accessKey: string;
  secretKey: string;
  stsBaseUrl: string;
}): Core {
  const { accessKey, secretKey, stsBaseUrl } = config;

  const res = new Core({
    accessKeyId: accessKey,
    accessKeySecret: secretKey,
    endpoint: stsBaseUrl,
    apiVersion: "2015-04-01",
  });
  return res;
}
