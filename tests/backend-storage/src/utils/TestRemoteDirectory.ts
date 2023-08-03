/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { getRandomString } from "@itwin/object-storage-core/lib/server/internal";

import {
  BaseDirectory,
  Metadata,
  ObjectReference,
  ServerStorage,
} from "@itwin/object-storage-core";

export class TestRemoteDirectory {
  constructor(
    private _serverStorage: ServerStorage,
    public readonly baseDirectory: BaseDirectory
  ) {}

  public async uploadFile(
    reference: Pick<ObjectReference, "relativeDirectory" | "objectName">,
    content: Buffer | undefined,
    metadata: Metadata | undefined
  ): Promise<ObjectReference> {
    const contentToUpload: Buffer =
      content ?? Buffer.from(`test file payload ${getRandomString()}`);
    const objectReference: ObjectReference = {
      baseDirectory: this.baseDirectory.baseDirectory,
      ...reference,
    };

    await this._serverStorage.upload(
      objectReference,
      contentToUpload,
      metadata
    );
    return objectReference;
  }
}
