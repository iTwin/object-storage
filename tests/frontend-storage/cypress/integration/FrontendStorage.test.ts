/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorage, ObjectReference } from "@itwin/object-storage-core";
import { ServerStorageProxyFrontend } from "../../src/server-storage-proxy/Frontend";
import { assertArrayBuffer } from "../utils/Helpers";
import { TestRemoteDirectoryManager } from "../utils/TestRemoteDirectoryManager";

const serverBaseUrl: string = (window as any).serverBaseUrl;
const frontendStorage: FrontendStorage = (window as any).frontendStorage;

describe(`${FrontendStorage.name}: ${frontendStorage.constructor.name}`, () => {
  const serverStorage = new ServerStorageProxyFrontend(serverBaseUrl);
  const testDirectoryManager = new TestRemoteDirectoryManager(serverStorage);

  before(() => {
    cy.visit(`${serverBaseUrl}/index.html`);
  });
  
  describe(`${frontendStorage.download.name}() & ${serverStorage.GetDownloadUrl.name}()`, () => {

    it("should download a file to buffer from URL", async () => {
      const contentBuffer = new TextEncoder().encode("test-download-from-url-to-buffer").buffer;
      const testDirectory = await testDirectoryManager.createNew();

      const objectReference: ObjectReference = {
        baseDirectory: testDirectory.baseDirectory,
        objectName: "test-download-from-url-to-buffer.txt"
      };
      await serverStorage.upload({
        data: contentBuffer,
        reference: objectReference,
      });

      const downloadUrl = await serverStorage.GetDownloadUrl({reference: objectReference});
      const response = await frontendStorage.download({
        url: downloadUrl,
        transferType: "buffer"
      });
      assertArrayBuffer(response, contentBuffer);
    });

  });

  // it("should download a file from URL to buffer", async () => {
  //   const content = "test-download-from-url-to-buffer";
  //   const contentBuffer = new TextEncoder().encode(content).buffer;
  //   const downloadUrl = await serverStorage.getTestDownloadUrl(content);
  //   expect(downloadUrl).to.not.be.empty;

  //   const downloaded = (await frontendStorage.download({
  //     url: downloadUrl,
  //     transferType: "buffer"
  //   }));
  //   assertArrayBuffer(downloaded, contentBuffer);
  // });

  // it("should download a file from URL to stream", async () => {
  //   const content = "test-download-from-url-to-stream";
  //   const contentBuffer = new TextEncoder().encode(content).buffer;
  //   const downloadUrl = await backendClient.getTestDownloadUrl(content);
  //   expect(downloadUrl).to.not.be.empty;

  //   const downloaded = await frontendStorage.download({
  //     url: downloadUrl,
  //     transferType: "buffer"
  //   });
  //   assertReadableStream(downloaded, contentBuffer);
  // });

  // it("should upload a file from buffer to URL", async () => {
  //   const contentBuffer = new TextEncoder().encode("test-upload-from-buffer-to-url").buffer;
  //   const uploadUrl = await backendClient.getTestUploadUrl();
  //   expect(uploadUrl).to.not.be.empty;

  //   await frontendStorage.upload({
  //     url: uploadUrl,
  //     data: contentBuffer
  //   });
    
  // });

  // it("should upload a file from stream to URL", async () => {
    
  // });
});
