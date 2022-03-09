/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
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
