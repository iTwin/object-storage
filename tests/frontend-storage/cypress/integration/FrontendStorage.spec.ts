/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorage } from "@itwin/object-storage-core";
import { BackendClient } from "../../src/frontend/BackendClient";
import { RestClient } from "../../src/frontend/RestClient";

const serverBaseUrl = (window as any).serverBaseUrl;
const frontendStorage = (window as any).frontendStorage;

describe(`${FrontendStorage.name}: ${frontendStorage.constructor.name}`, () => {

  const backendClient = new BackendClient(serverBaseUrl, new RestClient());

  before(() => {
    cy.visit(backendClient.entrypoint);
  });

  after(async () => {
    await backendClient.cleanup();
  });

  it("should download file from url", async () => {
    // const testFilePayload = "test payload";
    // const downloadUrl: string = await backendClient.getTestDownloadUrl(testFilePayload);
    // expect(downloadUrl).to.not.be.empty;

    // TODO: add correct assertions
    await frontendStorage.download({
      transferType: "buffer",
      url: "https://austejaobjectstorage.blob.core.windows.net/base-dir-49e2d38b-1dc9-44c9-bd72-b3396c93519a/file-c3855889-3487-4d3e-bb64-3f8ee3c90b5d?sp=r&st=2022-04-28T12:41:18Z&se=2022-04-28T20:41:18Z&spr=https&sv=2020-08-04&sr=b&sig=tHITJ3N%2BTbrC84v5qIioJuWTP%2F1vLFRaZK%2FATpu5vfM%3D"
    });
  });
});
