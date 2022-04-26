/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorage } from "@itwin/object-storage-core";
import { BackendClient } from "../../src/frontend/BackendClient";
import { RestClient } from "../../src/frontend/RestClient";

const frontendStorage = (window as any).frontendStorage;

describe(`${FrontendStorage.name}: ${frontendStorage.constructor.name}`, () => {
  const backendClient = new BackendClient(new RestClient());

  before(() => {
    cy.visit(backendClient.entrypoint);
  });

  it("should download fule from url", async () => {
    const testFilePayoload = "test payload";
    const downloadUrl: string = await backendClient.getTestDownloadUrl(testFilePayoload);
    expect(downloadUrl).to.not.be.empty;

    // TODO: add correct assertions
    // const downloadedFileContents: Buffer = (await frontendStorage.download({
    //   transferType: "buffer",
    //   url: downloadUrl
    // }));
  });
});
