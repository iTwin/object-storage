/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  assertPrimitiveType,
  FalsyValueError,
} from "@itwin/cloud-agnostic-core/lib/internal";
import { TransferConfig } from "@itwin/object-storage-core/lib/common";
import { assertTransferConfig } from "@itwin/object-storage-core/lib/common/internal";

import { GoogleTransferConfig } from "./Interfaces";

export function assertGoogleTransferConfig(
  transferConfig: TransferConfig | GoogleTransferConfig
): asserts transferConfig is GoogleTransferConfig {
  assertTransferConfig(transferConfig);
  if (!("authentication" in transferConfig))
    throw new FalsyValueError("transferConfig.authentication");

  assertPrimitiveType(
    transferConfig.authentication,
    "transferConfig.authentication",
    "string"
  );
  assertPrimitiveType(
    transferConfig.baseUrl,
    "transferConfig.baseUrl",
    "string"
  );
  assertPrimitiveType(
    transferConfig.expiration,
    "transferConfig.expiration",
    "object"
  );
}
