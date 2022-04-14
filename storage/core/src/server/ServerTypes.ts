/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/naming-convention */

const types = {
  presignedUrlProvider: Symbol.for("ServerTypes.PresignedUrlProvider"),
  transferConfigProvider: Symbol.for("ServerTypes.TransferConfigProvider"),
};

export { types as ServerTypes };
