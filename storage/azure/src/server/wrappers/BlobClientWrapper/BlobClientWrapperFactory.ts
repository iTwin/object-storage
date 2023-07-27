/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import { AzureTransferConfigInput } from "../../../common";
import { buildBlobUrl } from "../../../common/internal";

import { BlobClientWrapper } from "./BlobClientWrapper";

@injectable()
export class BlobClientWrapperFactory {
  public create(input: AzureTransferConfigInput): BlobClientWrapper {
    const blobClient = new BlobClient(buildBlobUrl(input));
    return new BlobClientWrapper(blobClient);
  }
}
