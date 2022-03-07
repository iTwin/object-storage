/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
export interface ExtensionConfig {
  extensionName: string;
}

export interface ExtensionsConfig {
  [extensionType: string]: ExtensionConfig;
}
