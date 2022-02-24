/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
export interface ExtensionConfig {
  extensionName: string;
}

export interface ExtensionsConfig {
  [extensionType: string]: ExtensionConfig;
}
