/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { STSClient } from "@aws-sdk/client-sts";

export class StsWrapper {
  constructor(private _client: STSClient) {}

  public get client(): STSClient {
    return this._client;
  }
}
