/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { StorageOptions } from "@itwin/object-storage-core";

export interface GoogleStorageConfig extends StorageOptions {
  projectId: string;
  bucketName: string;
}
