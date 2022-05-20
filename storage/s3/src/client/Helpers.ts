import { S3ClientWrapper } from "./S3ClientWrapper";

export async function createAndUseClient<TResult>(
  clientFactory: () => S3ClientWrapper,
  method: (clientWrapper: S3ClientWrapper) => Promise<TResult>
): Promise<TResult> {
  const clientWrapper = clientFactory();

  try {
    return await method(clientWrapper);
  } finally {
    clientWrapper.releaseResources();
  }
}