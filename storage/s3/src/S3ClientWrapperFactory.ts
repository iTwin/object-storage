import { inject, injectable } from "inversify";

import { TransferConfig } from "@itwin/object-storage-core/lib/frontend";

import { assertS3TransferConfig, createS3Client } from "./Helpers";
import { S3ClientWrapper } from "./S3ClientWrapper";
import { S3FrontendStorageConfig } from "./S3FrontendStorageConfig";
import { Types } from "./Types";

@injectable()
export abstract class S3ClientWrapperFactory {
  private readonly _bucket: string;

  public constructor(
    @inject(Types.S3Server.config) config: S3FrontendStorageConfig
  ) {
    this._bucket = config.bucket;
  }

  public create(transferConfig: TransferConfig): S3ClientWrapper {
    assertS3TransferConfig(transferConfig);

    const { baseUrl, region, authentication } = transferConfig;
    const { accessKey, secretKey, sessionToken } = authentication;

    return new S3ClientWrapper(
      createS3Client({ baseUrl, region, accessKey, secretKey, sessionToken }),
      this._bucket
    );
  }
}
