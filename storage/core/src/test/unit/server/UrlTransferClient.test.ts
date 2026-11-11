/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { promises } from "fs";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { AddressInfo } from "net";
import * as path from "path";

import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { TransferProgress } from "../../../common";
import { UrlTransferClient } from "../../../server/internal";

use(chaiAsPromised);

type RequestHandler = (
  request: IncomingMessage,
  response: ServerResponse,
  body: Promise<Buffer>
) => void;

describe(`${UrlTransferClient.name}.upload()`, () => {
  const tempDirectory = path.join(__dirname, "temp-url-transfer-client");
  const content = Buffer.alloc(300 * 1024, "a");

  let server: Server;
  let url: string;
  let requestCount: number;
  let handler: RequestHandler;
  let receivedBodies: Buffer[];

  before(async () => {
    await promises.mkdir(tempDirectory, { recursive: true });
    server = createServer((request, response) => {
      requestCount++;
      const body = new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        request.on("data", (chunk: Buffer) => chunks.push(chunk));
        request.on("end", () => resolve(Buffer.concat(chunks)));
        request.on("error", reject);
      });
      handler(request, response, body);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve)
    );
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/object`;
  });

  beforeEach(() => {
    requestCount = 0;
    receivedBodies = [];
    handler = (_request, response, body) => {
      void body.then((data) => {
        receivedBodies.push(data);
        response.end();
      });
    };
  });

  afterEach(() => {
    server.closeAllConnections();
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await promises.rm(tempDirectory, { recursive: true, force: true });
  });

  function expectCompleteProgress(
    events: TransferProgress[],
    size: number
  ): void {
    expect(events).to.not.be.empty;
    for (let i = 1; i < events.length; i++)
      expect(events[i].loadedBytes).to.be.at.least(events[i - 1].loadedBytes);
    events.forEach((event) => expect(event.totalBytes).to.equal(size));
    expect(events[events.length - 1].loadedBytes).to.equal(size);
  }

  it("should report progress for buffer", async () => {
    const events: TransferProgress[] = [];

    await new UrlTransferClient().upload(url, content, undefined, {
      onProgress: (progress) => events.push(progress),
    });

    expectCompleteProgress(events, content.byteLength);
    expect(receivedBodies).to.have.length(1);
    expect(receivedBodies[0].equals(content)).to.be.true;
  });

  it("should report progress for local file", async () => {
    const filePath = path.join(tempDirectory, "upload.txt");
    await promises.writeFile(filePath, content);
    const events: TransferProgress[] = [];

    await new UrlTransferClient().upload(url, filePath, undefined, {
      onProgress: (progress) => events.push(progress),
    });

    expectCompleteProgress(events, content.byteLength);
    expect(receivedBodies[0].equals(content)).to.be.true;
  });

  it("should not report progress ahead of the data received by the server", async () => {
    const largeContent = Buffer.alloc(16 * 1024 * 1024, "a");
    let serverReadBytes = 0;
    handler = (request, response, body) => {
      request.pause();
      request.on("data", (chunk: Buffer) => (serverReadBytes += chunk.length));
      setTimeout(() => request.resume(), 200);
      void body.then(() => response.end());
    };
    let serverReadBytesAtTotal: number | undefined;

    await new UrlTransferClient().upload(url, largeContent, undefined, {
      onProgress: ({ loadedBytes }) => {
        if (
          loadedBytes === largeContent.byteLength &&
          serverReadBytesAtTotal === undefined
        )
          serverReadBytesAtTotal = serverReadBytes;
      },
    });

    expect(serverReadBytesAtTotal).to.be.greaterThan(
      largeContent.byteLength / 2
    );
  });

  it("should not fail upload if progress callback throws", async () => {
    await new UrlTransferClient().upload(url, content, undefined, {
      onProgress: () => {
        throw new Error("Callback error");
      },
    });

    expect(receivedBodies[0].equals(content)).to.be.true;
  });

  it("should not send request if signal is already aborted", async () => {
    const abortController = new AbortController();
    abortController.abort();

    await expect(
      new UrlTransferClient().upload(url, content, undefined, {
        abortSignal: abortController.signal,
      })
    ).to.be.rejected.and.eventually.have.property("name", "AbortError");
    expect(requestCount).to.equal(0);
  });

  it("should abort upload in progress", async () => {
    const abortController = new AbortController();
    handler = () => abortController.abort();

    await expect(
      new UrlTransferClient().upload(url, content, undefined, {
        abortSignal: abortController.signal,
      })
    ).to.be.rejected.and.eventually.have.property("name", "AbortError");
    expect(requestCount).to.equal(1);
  });

  it("should abort upload while waiting to retry", async () => {
    const abortController = new AbortController();
    handler = (_request, response, body) => {
      void body.then(() => {
        response.writeHead(503).end();
        setTimeout(() => abortController.abort(), 100);
      });
    };
    const startTime = Date.now();

    await expect(
      new UrlTransferClient({ retryDelayMs: 10000 }).upload(
        url,
        content,
        undefined,
        { abortSignal: abortController.signal }
      )
    ).to.be.rejected.and.eventually.have.property("name", "AbortError");
    expect(Date.now() - startTime).to.be.below(5000);
    expect(requestCount).to.equal(1);
  });
});
