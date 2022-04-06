import { BlockBlobClient } from "@azure/storage-blob";

import { AzureFrontendStorage } from "./AzureFrontendStorage";
import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";

export class AzureClientStorage extends AzureFrontendStorage {
  protected override getBlockBlobClientWrapper(
    blobClient: BlockBlobClient
  ): BlockBlobClientWrapper {
    return new BlockBlobClientWrapper(blobClient);
  }
}
