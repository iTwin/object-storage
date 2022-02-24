/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { TransferConfig } from "@itwin/object-storage-core";

export interface AzureTransferConfig extends TransferConfig {
  authentication: string;
}
