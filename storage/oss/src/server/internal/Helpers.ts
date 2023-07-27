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

  return new Core({
    accessKeyId: accessKey,
    accessKeySecret: secretKey,
    endpoint: stsBaseUrl,
    apiVersion: "2015-04-01",
  });
}

export function getActions(): string[] {
  const actions: string[] = [
    "oss:GetObject",
    "oss:PutObject",
    "oss:DeleteObject",
    "oss:ListObjects",
  ];

  return actions;
}
