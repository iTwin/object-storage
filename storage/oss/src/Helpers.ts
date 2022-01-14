/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";

export function createCore(config: {
  accessKey: string;
  secretKey: string;
  stsBaseUrl: string;
}): Core {
  const { accessKey, secretKey, stsBaseUrl } = config;

  return new Core({
    accessKeyId: accessKey,
    accessKeySecret: secretKey,
    endpoint: stsBaseUrl,
    apiVersion: "2015-04-01",
  });
}
