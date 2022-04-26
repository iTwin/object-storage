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
  private _createdDirectories: BaseDirectory[] = [];

  constructor() {
    super();
    this.requireDependency(ServerStorageDependency.dependencyType);
  }

  public start(): void {
    this.bindDependencies(this.container);
    const serverStorage = this.container.get(ServerStorage);

    const expressInstance = express();

    const publicDir = path.resolve(__dirname, "..", "public");
    expressInstance.use(express.static(publicDir));

    expressInstance.use(express.json());
    expressInstance.post("/download-url", async (request: Request, response: Response) =>
      this.handlePostDownloadUrl(serverStorage, request, response)
    );
    expressInstance.post("/cleanup", async (_request: Request, response: Response) =>
      this.handlePostCleanup(serverStorage, response)
    );

    expressInstance.listen(Constants.port, () => {
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
        const baseDirectory: BaseDirectory = { baseDirectory: `base-dir-${randomUUID()}` };
        await serverStorage.createBaseDirectory(baseDirectory);
        this._createdDirectories.push(baseDirectory);

        const reference: ObjectReference = {
          ...baseDirectory,
          objectName: `file-${randomUUID()}`,
        };
        await serverStorage.upload(reference, Buffer.from(request.body.filePayload));

        const downloadUrl = await serverStorage.getDownloadUrl(reference, 30);

        response.status(201).send({ downloadUrl });
      } else {
        response.status(400).send();
      }
    });
  }

  private async handlePostCleanup(
    serverStorage: ServerStorage,
    response: Response
  ): Promise<void> {
    return this.handleFailure(response, async () => {
      for (const createdDirectory of this._createdDirectories) {
        if (await serverStorage.baseDirectoryExists(createdDirectory))
          await serverStorage.deleteBaseDirectory(createdDirectory);
      }
      this._createdDirectories = [];
      response.status(204).send();
    });
  }

  private async handleFailure(
    response: Response,
    action: () => Promise<void>
  ): Promise<void> {
    try {
      await action();
    } catch (error: unknown) {
      console.error(JSON.stringify(error));
      response.status(500).send();
    }
  }
}
