/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { randomUUID } from "crypto";
import * as path from "path";

import * as express from "express";
import { Request, Response } from "express";
import { Container } from "inversify";

import { Bindable } from "@itwin/cloud-agnostic-core";
import {
  BaseDirectory,
  ObjectReference,
  ServerStorage,
  ServerStorageDependency,
} from "@itwin/object-storage-core";

import { Constants } from "./Constants";

interface GetTestDownloadUrlRequest {
  filePayload: string;
}

function isGetTestDownloadUrlRequest(
  request: unknown
): request is GetTestDownloadUrlRequest {
  return !!(request as GetTestDownloadUrlRequest).filePayload;
}

export class BackendStorageServer extends Bindable {
  public readonly container = new Container();
  constructor() {
    super();
    this.requireDependency(ServerStorageDependency.dependencyType);
  }

  public start(): void {
    this.bindDependencies(this.container);
    const serverStorage = this.container.get(ServerStorage);

    const server = express();

    const publicDir = path.resolve(__dirname, "..", "public");
    server.use(express.static(publicDir));

    server.use(express.json());
    server.post("/download-url", async (request: Request, response: Response) =>
      this.handlePostDownloadUrl(serverStorage, request, response)
    );

    server.listen(Constants.port, () => {
      // eslint-disable-next-line no-console
      console.log(
        `Test storage server started at http://localhost:${Constants.port}`
      );
    });
  }

  private async handlePostDownloadUrl(
    serverStorage: ServerStorage,
    request: Request,
    response: Response
  ): Promise<void> {
    return this.handleFailure(response, async () => {
      if (isGetTestDownloadUrlRequest(request.body)) {
        const reference = await this.uploadTestFile(
          serverStorage,
          request.body.filePayload
        );
        const downloadUrl = await serverStorage.getDownloadUrl(reference, 30);
        response.send({ downloadUrl });
      } else {
        response.status(400).send();
      }
    });
  }

  private async handleFailure(
    response: Response,
    action: () => Promise<void>
  ): Promise<void> {
    try {
      await action();
    } catch {
      response.status(500).send();
    }
  }

  private async uploadTestFile(
    serverStorage: ServerStorage,
    filePayload: string
  ): Promise<ObjectReference> {
    const baseDirectory: BaseDirectory = { baseDirectory: "foo" };
    if (!(await serverStorage.baseDirectoryExists(baseDirectory)))
      await serverStorage.createBaseDirectory(baseDirectory);

    const reference: ObjectReference = {
      ...baseDirectory,
      objectName: `foo-${randomUUID()}`,
    };
    await serverStorage.upload(reference, Buffer.from(filePayload));
    return reference;
  }
}
