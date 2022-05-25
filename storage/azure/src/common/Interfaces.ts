/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { TransferConfig, ObjectReference } from "@itwin/object-storage-core/lib/common";

export interface AzureTransferConfig extends TransferConfig {
  authentication: string;
}

export interface AzureTransferConfigInput {
  transferConfig: AzureTransferConfig;
  reference: ObjectReference;
}