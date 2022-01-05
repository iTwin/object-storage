/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Client } from "minio";

export function createClient(config: {
  accessKey: string;
  hostname: string;
  protocol: string;
  secretKey: string;
}): Client {
  const { accessKey, hostname, protocol, secretKey } = config;

  const parts = hostname.split(":");
  const endPoint = parts[0];
  const port = parts.length === 2 ? Number(parts[1]) : undefined;

  return new Client({
    endPoint,
    port,
    useSSL: protocol === "https",
    accessKey,
    secretKey,
  });
}
