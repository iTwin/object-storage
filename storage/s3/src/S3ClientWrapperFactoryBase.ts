import { S3Client } from "@aws-sdk/client-s3";
import { inject, injectable, unmanaged } from "inversify";

import { TransferConfig } from "@itwin/object-storage-core/lib/frontend";

import { assertS3TransferConfig, createS3Client } from "./Helpers";
import { S3ClientStorageConfig } from "./S3ClientStorageConfig";
import { Types } from "./Types";

@injectable()
export abstract class S3ClientWrapperFactoryBase<TClient> {
  private readonly _bucket: string;

  public constructor(
    @unmanaged()
    private _clientConstructor: new (
      client: S3Client,
      bucket: string
    ) => TClient,
    @inject(Types.S3Server.config) config: S3ClientStorageConfig
  ) {
    this._bucket = config.bucket;
  }

  public create(transferConfig: TransferConfig): TClient {
    assertS3TransferConfig(transferConfig);

    const { baseUrl, region, authentication } = transferConfig;
    const { accessKey, secretKey, sessionToken } = authentication;

    return new this._clientConstructor(
      createS3Client({ baseUrl, region, accessKey, secretKey, sessionToken }),
      this._bucket
    );
  }
}
