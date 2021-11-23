export abstract class ServerSideStorage {
  public abstract download(
    reference: ObjectReference,
    type: TransferType,
    localPath?: string
  ): Promise<TransferData>;

  public abstract upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Record<string, unknown>
  ): Promise<void>;

  public abstract uploadInMultipleParts(
    reference: ObjectReference,
    data: TransferData,
    partCount: number,
    metadata?: Record<string, unknown>
  ): Promise<void>;

  public abstract delete(reference: ObjectReference): Promise<void>;

  public abstract updateMetadata(
    reference: ObjectReference,
    metadata: Record<string, unknown>
  ): Promise<void>;

  public abstract createStorage(name: string): Promise<void>;
  public abstract deleteStorage(name: string): Promise<void>;

  public abstract getDownloadUrl(reference: ObjectReference): Promise<string>;
  public abstract getUploadUrl(reference: ObjectReference): Promise<string>;
  public abstract getUpdateMetadataUrl(
    reference: ObjectReference
  ): Promise<void>;

  /** Azure will only be limited to baseDirectory. */
  public abstract getDownloadConfig(
    directory: ObjectDirectory
  ): Promise<TransferConfig>;
  /** Azure will only be limited to baseDirectory. */
  public abstract getUploadConfig(
    directory: ObjectDirectory
  ): Promise<TransferConfig>;
}

export abstract class ClientSideStorage {
  public abstract download(
    url: string,
    type: TransferType,
    localPath?: string
  ): Promise<TransferData>;
  public abstract download(
    reference: ObjectReference,
    type: TransferType,
    transferConfig: TransferConfig,
    localPath?: string
  ): Promise<TransferData>;

  public abstract upload(
    url: string,
    data: TransferData,
    metadata?: Record<string, unknown>
  ): Promise<void>;
  public abstract upload(
    reference: ObjectReference,
    data: TransferData,
    transferConfig: TransferConfig,
    metadata?: Record<string, unknown>
  ): Promise<void>;

  public abstract uploadInMultipleParts(
    reference: ObjectReference,
    data: TransferData,
    partCount: number,
    transferConfig: TransferConfig,
    metadata?: Record<string, unknown>
  ): Promise<void>;

  public abstract updateMetadata(
    url: string,
    metadata: Record<string, unknown>
  ): Promise<void>;
  public abstract updateMetadata(
    reference: ObjectReference,
    metadata: Record<string, unknown>,
    transferConfig: TransferConfig
  ): Promise<void>;
}

type TransferType = "blob" | "stream" | "local";
type TransferData = Blob | ReadableStream | string;

export interface ObjectDirectory {
  /** Storage account for Azure. Bucket for S3. */
  storage: string;
  /** Container for Azure. First directory of a prefix for S3. */
  baseDirectory: string;
  /** Additional directories in the path to object. */
  relativeDirectory?: string;
}

export interface ObjectReference extends ObjectDirectory {
  objectName: string;
}

export interface TransferConfig {
  protocol: "http" | "https";
  hostname: string;
  authentication: string | TemporaryS3Credentials;
  expiration: Date;
}

export interface S3Credentials {
  accessKey: string;
  secretKey: string;
}

export interface TemporaryS3Credentials extends S3Credentials {
  sessionToken: string;
}
