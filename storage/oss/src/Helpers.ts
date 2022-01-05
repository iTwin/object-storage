/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";

export function createCore(config: {
  accessKey: string;
  secretKey: string;
  protocol: string;
  stsHostname: string;
}): Core {
  const { accessKey, secretKey, protocol, stsHostname } = config;

  return new Core({
    accessKeyId: accessKey,
    accessKeySecret: secretKey,
    endpoint: `${protocol}://${stsHostname}`,
    apiVersion: "2015-04-01",
  });
}
