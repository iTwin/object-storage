/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorage, FrontendTransferType } from "@itwin/object-storage-core/lib/frontend";
import {
  TestCase,
  ServerStorageProxyFrontend,
  FrontendTestRemoteDirectoryManager,
  testDownload,
  testUpload,
  InputMethod,
} from "../../src/frontend";

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
    for(const transferType of ["buffer", "stream"] as Array<FrontendTransferType>)
    for(const inputMethod of ["url", "config"] as Array<InputMethod>) {
      it(`should download to ${transferType} from ${inputMethod}`, async () => {
        await testDownload(test, transferType, inputMethod);
      });
    }
  });

  describe(`${frontendStorage.upload.name}()`, () => {
    for(const transferType of ["buffer", "stream"] as  Array<FrontendTransferType>)
    for(const inputMethod of ["url", "config"] as Array<InputMethod>)
    for(const useMetadata of [false, true] as Array<boolean>)
    for(const useRelativeDir of [false, true] as Array<boolean>) {
      const title = `should upload ${transferType} using ${inputMethod}` +
        (useMetadata ? " with metadata" : "") +
        (useRelativeDir ? " with relative dir": "");

      it(title, async () => {
        await testUpload(test, "buffer", "url");
      });
    }
  });
});