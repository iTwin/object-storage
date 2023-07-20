/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";

import { Permissions } from "@itwin/object-storage-core";

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

export function getActionsFromPermissions(permissions?: Permissions): string[] {
  const actions: string[] = permissions
    ? getActionsFromRequestedPermissions(permissions)
    : getAllActions();

  return actions;
}

function getActionsFromRequestedPermissions(
  permissions: Permissions
): string[] {
  const actions: string[] = [];
  if (permissions.read) actions.push("oss:GetObject");
  if (permissions.write) actions.push("oss:PutObject");
  if (permissions.delete) actions.push("oss:DeleteObject", "oss:DeleteObjects");
  if (permissions.list) actions.push("oss:ListObjects", "oss:ListObjectsV2");

  return actions;
}

function getAllActions(): string[] {
  const actions: string[] = [
    "oss:GetObject",
    "oss:PutObject",
    "oss:DeleteObject",
    "oss:DeleteObjects",
    "oss:ListObjects",
    "oss:ListObjectsV2",
  ];

  return actions;
}
