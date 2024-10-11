/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ObjectReference,
  TransferConfig,
} from "@itwin/object-storage-core/lib/common";

export interface GoogleTransferConfig extends TransferConfig {
  authentication: string;
  bucketName: string;
}

export interface GoogleTransferConfigInput {
  transferConfig: GoogleTransferConfig;
  reference: ObjectReference;
}
