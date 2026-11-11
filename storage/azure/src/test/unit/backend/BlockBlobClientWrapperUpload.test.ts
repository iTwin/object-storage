/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createServer, Server } from "http";
import { AddressInfo } from "net";
import { Readable } from "stream";

import { AnonymousCredential, BlockBlobClient } from "@azure/storage-blob";
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { BlockBlobClientWrapper } from "../../../server";

use(chaiAsPromised);

describe(`${BlockBlobClientWrapper.name} stream upload`, () => {
  let server: Server;
  let blobUrl: string;
  let requestCount: number;

  before(async () => {
    server = createServer((request, response) => {
      requestCount++;
      request.resume();
      request.on("end", () => response.writeHead(201).end());
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve)
    );
    const { port } = server.address() as AddressInfo;
    blobUrl = `http://127.0.0.1:${port}/account/container/blob`;
  });

  beforeEach(() => {
    requestCount = 0;
  });

  after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  function createWrapper(): BlockBlobClientWrapper {
    return new BlockBlobClientWrapper(
      new BlockBlobClient(blobUrl, new AnonymousCredential())
    );
  }

  function createAbortedSignal(): AbortSignal {
    const abortController = new AbortController();
    abortController.abort();
    return abortController.signal;
  }

  it("should not send any data on upload if signal is already aborted", async () => {
    await expect(
      createWrapper().upload(
        Readable.from([Buffer.alloc(1024)]),
        undefined,
        undefined,
        { abortSignal: createAbortedSignal() }
      )
    ).to.be.rejected.and.eventually.have.property("name", "AbortError");
    expect(requestCount).to.equal(0);
  });

  it("should not send any data on multipart upload if signal is already aborted", async () => {
    await expect(
      createWrapper().uploadInMultipleParts(
        Readable.from([Buffer.alloc(1024)]),
        undefined,
        undefined,
        { abortSignal: createAbortedSignal() }
      )
    ).to.be.rejected.and.eventually.have.property("name", "AbortError");
    expect(requestCount).to.equal(0);
  });
});
