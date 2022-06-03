/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as path from "path";

import * as express from "express";
import { Container } from "inversify";

import { Bindable } from "@itwin/cloud-agnostic-core";
import {
  ServerStorage,
  ServerStorageDependency,
} from "@itwin/object-storage-core";

import * as Common from "./Common";

export class ServerStorageProxyBackend extends Bindable {
  public readonly container = new Container();

  constructor() {
    super();
    this.requireDependency(ServerStorageDependency.dependencyType);
  }

  public start(config: { port: number }): void {
    this.bindDependencies(this.container);
    const serverStorage = this.container.get(ServerStorage);

    const app = express();
    const publicDir = path.resolve(__dirname, "..", "..", "public");
    app.use(express.static(publicDir));
    app.use(express.json());

    // Not exactly REST but it's for tests only
    app.post(Common.DOWNLOAD_REQUEST_PATH, async (request, response) => {
      const body = request.body as Common.DownloadRequest;
      const result = await serverStorage.download(body.reference, "buffer");
      response.status(200).send(result);
    });
    app.post(Common.UPLOAD_REQUEST_PATH, async (request, response) => {
      const body = request.body as Common.UploadRequest;
      const dataBuffer = Buffer.from(body.data);
      await serverStorage.upload(body.reference, dataBuffer, body.metadata);
      response.status(201).send();
    });
    app.post(
      Common.CREATE_BASE_DIRECTORY_REQUEST_PATH,
      async (request, response) => {
        const body = request.body as Common.CreateBaseDirectoryRequest;
        await serverStorage.createBaseDirectory(body.directory);
        response.status(201).send();
      }
    );
    app.post(
      Common.DELETE_BASE_DIRECTORY_REQUEST_PATH,
      async (request, response) => {
        const body = request.body as Common.DeleteBaseDirectoryRequest;
        await serverStorage.deleteBaseDirectory(body.directory);
        response.status(204).send();
      }
    );
    app.post(Common.DELETE_OBJECT_REQUEST_PATH, async (request, response) => {
      const body = request.body as Common.DeleteObjectRequest;
      await serverStorage.deleteObject(body.reference);
      response.status(204).send();
    });
    app.post(
      Common.BASE_DIRECTORY_EXISTS_REQUEST_PATH,
      async (request, response) => {
        const body = request.body as Common.BaseDirectoryExistsRequest;
        const result = await serverStorage.baseDirectoryExists(body.directory);
        response.status(200).send(result);
      }
    );
    app.post(Common.OBJECT_EXISTS_REQUEST_PATH, async (request, response) => {
      const body = request.body as Common.ObjectExistsRequest;
      const result = await serverStorage.objectExists(body.reference);
      response.status(200).send(result);
    });
    app.post(
      Common.GET_OBJECT_PROPERTIES_REQUEST_PATH,
      async (request, response) => {
        const body = request.body as Common.GetObjectPropertiesRequest;
        const result = await serverStorage.getObjectProperties(body.reference);
        response.status(200).send(result);
      }
    );
    app.post(
      Common.GET_DOWNLOAD_URL_REQUEST_PATH,
      async (request, response) => {
        const body = request.body as Common.GetDownloadUrlRequest;
        const result = await serverStorage.getDownloadUrl(
          body.reference,
          body.expiresInSeconds
        );
        response.status(200).send(result);
      }
    );
    app.post(Common.GET_UPLOAD_URL_REQUEST_PATH, async (request, response) => {
      const body = request.body as Common.GetUploadUrlRequest;
      const result = await serverStorage.getUploadUrl(
        body.reference,
        body.expiresInSeconds
      );
      response.status(200).send(result);
    });
    app.post(
      Common.GET_DOWNLOAD_CONFIG_REQUEST_PATH,
      async (request, response) => {
        const body = request.body as Common.GetDownloadConfigRequest;
        const result = await serverStorage.getDownloadConfig(
          body.directory,
          body.expiresInSeconds
        );
        response.status(200).send(result);
      }
    );
    app.post(
      Common.GET_UPLOAD_CONFIG_REQUEST_PATH,
      async (request, response) => {
        const body = request.body as Common.GetUploadConfigRequest;
        const result = await serverStorage.getUploadConfig(
          body.directory,
          body.expiresInSeconds
        );
        response.status(200).send(result);
      }
    );

    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(
        `Test storage server started at http://localhost:${config.port}`
      );
    });
  }
}
