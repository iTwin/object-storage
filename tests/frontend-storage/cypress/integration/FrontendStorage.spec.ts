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
    const testFilePayload = "test payload";
    const downloadUrl: string = await backendClient.getTestDownloadUrl(testFilePayload);
    expect(downloadUrl).to.not.be.empty;

    // TODO: add correct assertions
    // const downloadedFileContents: Buffer = (await frontendStorage.download({
    //   transferType: "buffer",
    //   url: downloadUrl
    // }));
  });
});
