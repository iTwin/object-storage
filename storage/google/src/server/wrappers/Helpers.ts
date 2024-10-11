/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

export type GoogleStorageConfigType = "read" | "write" | "user";

export function roleFromConfigType(
  configType: GoogleStorageConfigType
): string {
  switch (configType) {
    case "read":
      return "inRole:roles/storage.objectViewer";
    case "write":
      return "inRole:roles/storage.objectCreator";
    case "user":
      return "inRole:roles/storage.objectUser";
  }
}
