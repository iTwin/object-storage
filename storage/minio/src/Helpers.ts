/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Client } from "minio";

export function createClient(config: {
  accessKey: string;
  baseUrl: string;
  secretKey: string;
}): Client {
  const { accessKey, baseUrl, secretKey } = config;

  const [protocol, hostname] = baseUrl.split("://");
  const [endPoint, port] = hostname.split(":");

  return new Client({
    endPoint,
    port: port ? Number(port) : undefined,
    useSSL: protocol === "https",
    accessKey,
    secretKey,
  });
}
