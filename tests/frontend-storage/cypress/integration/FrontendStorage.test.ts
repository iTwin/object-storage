/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorage } from "@itwin/object-storage-core";
import { ServerStorageProxyFrontend } from "../../src/backend/server-storage-proxy/Frontend";
import { FrontendTestRemoteDirectoryManager } from "../../src/frontend/utils/RemoteDirectoryManager";
import { testDownload } from "../../src/frontend/test-templates/Download";
import { testUpload } from "../../src/frontend/test-templates/Upload";
import { TestCase } from "../../src/frontend/Interfaces";

const serverBaseUrl: string = (window as any).serverBaseUrl;
const frontendStorage: FrontendStorage = (window as any).frontendStorage;
const serverStorage = new ServerStorageProxyFrontend(serverBaseUrl);
const directoryManager = new FrontendTestRemoteDirectoryManager(serverStorage)

describe(`${FrontendStorage.name}: ${frontendStorage.constructor.name}`, () => {
  const test: TestCase = {serverStorage, directoryManager, frontendStorage};

  before(() => {
    cy.visit(`${serverBaseUrl}/index.html`);
  });
  beforeEach(async () => {
    await directoryManager.purgeCreatedDirectories();
  });
  after(async () => {
    await directoryManager.purgeCreatedDirectories();
  });
  
  describe(`${frontendStorage.download.name}()`, () => {
    it("should download to buffer using URL", async () => {
      await testDownload(test, "buffer", "url");
    });
    it("should download to stream using URL", async () => {
      await testDownload(test, "stream", "url");
    });
    it("should download to buffer using transfer config", async () => {
      await testDownload(test, "buffer", "config");
    });
    it("should download to stream using transfer config", async () => {
      await testDownload(test, "stream", "config");
    })
  });
  describe(`${frontendStorage.upload.name}()`, () => {
    it("should upload buffer using URL", async () => {
      await testUpload(test, "buffer", "url");
    });
    it("should upload stream using URL", async () => {
      await testUpload(test, "stream", "url");
    });
    it("should upload buffer using transfer config", async () => {
      await testUpload(test, "buffer", "config");
    });
    it("should upload stream using transfer config", async () => {
      await testUpload(test, "stream", "config");
    });
    it("should upload buffer with metadata using transfer config", async () => {
      await testUpload(test, "buffer", "config", true);
    });
    it("should upload stream with metadata using transfer config", async () => {
      await testUpload(test, "stream", "config", true);
    });
    it("should upload buffer with relative directory using transfer config", async () => {

    });
    it("should upload stream with relative directory using transfer config", async () => {
      
    });
  });
});