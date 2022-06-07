/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ObjectReference,
  FrontendStorage,
  FrontendTransferData,
  FrontendTransferType,
} from "@itwin/object-storage-core/lib/frontend";

import {
  ServerStorageProxyFrontend,
  FrontendTestRemoteDirectoryManager,
  stringToArrayBuffer,
  assertArrayBuffer,
  assertReadableStream,
  arrayBufferToReadableStream,
} from "../../src/frontend";

type InputMethod = "url" | "config";

const serverBaseUrl: string = (window as any).serverBaseUrl;
const frontendStorage: FrontendStorage = (window as any).frontendStorage;
const serverStorage = new ServerStorageProxyFrontend(serverBaseUrl);
const directoryManager = new FrontendTestRemoteDirectoryManager(serverStorage);

describe(`${FrontendStorage.name}: ${frontendStorage.constructor.name}`, () => {
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
        const testData = `test-download-to-${transferType}-using-${inputMethod}`;
        const testDataBuffer = stringToArrayBuffer(testData);
        const directory = await directoryManager.createNew();
        const reference: ObjectReference = {
          baseDirectory: directory.baseDirectory,
          objectName: testData,
        };
        await serverStorage.upload({ data: testData, reference });

        switch (inputMethod) {
          case "url":
            const url = await serverStorage.getDownloadUrl({ reference });
            switch (transferType) {
              case "buffer":
                const responseBuffer = await frontendStorage.download({ url, transferType });
                assertArrayBuffer(responseBuffer, testDataBuffer);
                break;
              case "stream":
                const responseStream = await frontendStorage.download({ url, transferType });
                await assertReadableStream(responseStream, testDataBuffer);
                return;
              default:
                throw new Error(`Missing test case for transfer type ${transferType}`);
            }
            break;
          case "config":
            const transferConfig = await serverStorage.getDownloadConfig({ directory });
            switch (transferType) {
              case "buffer":
                const responseBuffer = await frontendStorage.download({
                  reference,
                  transferConfig,
                  transferType,
                });
                assertArrayBuffer(responseBuffer, testDataBuffer);
                break;
              case "stream":
                const responseStream = await frontendStorage.download({
                  reference,
                  transferConfig,
                  transferType,
                });
                await assertReadableStream(responseStream, testDataBuffer);
                break;
      
              default:
                throw new Error(`Missing test case for transfer type ${transferType}`);
            }
            break;
            default:
              throw new Error(`Missing test case for input method ${inputMethod}`);
        }
      });
    }
  });

  describe(`${frontendStorage.upload.name}()`, () => {
    for(const transferType of ["buffer", "stream"] as  Array<FrontendTransferType>)
    for(const inputMethod of ["url", "config"] as Array<InputMethod>)
    for(const useMetadata of [false, true] as Array<boolean>)
    for(const useRelativeDir of [false, true] as Array<boolean>) {
      it(`should upload ${transferType} using ${inputMethod}${useMetadata ? " with metadata" : ""}${useRelativeDir ? " with relative dir" : ""}`, async () => {
        const testData = `test-upload-to-url-from-${transferType}`;
        const testDataBuffer = stringToArrayBuffer(testData);
        const directory = await directoryManager.createNew();
        const reference: ObjectReference = {
          baseDirectory: directory.baseDirectory,
          relativeDirectory: useRelativeDir ? "test-relative-1/test-relative-2" : undefined,
          objectName: testData,
        };
        const metadata = useMetadata ? { test: "test-metadata" } : undefined;

        let dataToUpload: FrontendTransferData;
        switch (transferType) {
          case "buffer":
            dataToUpload = testDataBuffer;
            break;
          case "stream":
            dataToUpload = arrayBufferToReadableStream(testDataBuffer);
            break;
          default:
            throw new Error(`Missing test case for transfer type ${transferType}`);
        }
      
        switch (inputMethod) {
          case "url":
            const url = await serverStorage.getUploadUrl({ reference });
            await frontendStorage.upload({
              url,
              data: dataToUpload,
              metadata,
            });
            break;
          case "config":
            const transferConfig = await serverStorage.getUploadConfig({
              directory,
            });
            await frontendStorage.upload({
              reference,
              transferConfig,
              data: dataToUpload,
              metadata,
            });
            break;
          default:
            throw new Error("testDownload(): invalid inputType parameter");
        }
        
        expect(await serverStorage.objectExists({ reference }), "Uploaded object does not exist").to.be.true;
        const uploadedData = await serverStorage.download({ reference });
        expect(uploadedData, "Uploaded content is different").to.equal(testData);
        if (metadata) {
          const objectProperties = await serverStorage.getObjectProperties({ reference });
          expect(objectProperties.metadata, "Mismatching metadata").to.deep.equal(metadata);
        }
      });
    }
  });
});
