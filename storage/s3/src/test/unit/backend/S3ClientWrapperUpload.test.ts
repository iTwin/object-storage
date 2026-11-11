/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { AddressInfo } from "net";

import { S3Client } from "@aws-sdk/client-s3";
import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { ObjectReference, TransferProgress } from "@itwin/object-storage-core";

import { S3ClientWrapper } from "../../../server";

use(chaiAsPromised);

type RequestHandler = (
  request: IncomingMessage,
  response: ServerResponse,
  body: Buffer
) => void;

interface ReceivedRequest {
  contentLength?: string;
  body: Buffer;
}

describe(`${S3ClientWrapper.name}.upload()`, () => {
  const reference: ObjectReference = {
    baseDirectory: "base",
    objectName: "object.txt",
  };
  const content = Buffer.from(
    Array.from({ length: 300 * 1024 }, (_, i) => i % 251)
  );

  let server: Server;
  let endpoint: string;
  let onRequest: (request: IncomingMessage) => void;
  let handler: RequestHandler;
  let requestCount: number;
  let receivedRequests: ReceivedRequest[];
  let client: S3Client;
  let wrapper: S3ClientWrapper;

  before(async () => {
    server = createServer((request, response) => {
      requestCount++;
      onRequest(request);
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        const body = Buffer.concat(chunks);
        receivedRequests.push({
          contentLength: request.headers["content-length"],
          body,
        });
        handler(request, response, body);
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve)
    );
    endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(() => {
    requestCount = 0;
    receivedRequests = [];
    onRequest = () => {};
    handler = (_request, response) => response.end();
    client = new S3Client({
      endpoint,
      region: "us-east-1",
      forcePathStyle: true,
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
    });
    wrapper = new S3ClientWrapper(client, "test-bucket");
  });

  afterEach(() => {
    client.destroy();
    server.closeAllConnections();
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  function expectNonDecreasing(events: TransferProgress[]): void {
    for (let i = 1; i < events.length; i++)
      expect(events[i].loadedBytes).to.be.at.least(events[i - 1].loadedBytes);
  }

  it("should report progress while sending body", async () => {
    const events: TransferProgress[] = [];

    await wrapper.upload(reference, content, undefined, undefined, {
      onProgress: (progress) => events.push(progress),
    });

    expect(events.length).to.be.greaterThan(2);
    expectNonDecreasing(events);
    events.forEach((event) =>
      expect(event.totalBytes).to.equal(content.byteLength)
    );
    expect(events[events.length - 1].loadedBytes).to.equal(content.byteLength);
    expect(receivedRequests).to.have.length(1);
    expect(receivedRequests[0].contentLength).to.equal(
      content.byteLength.toString()
    );
    expect(receivedRequests[0].body.equals(content)).to.be.true;
  });

  it("should resend whole body and restart progress on retry", async () => {
    handler = (_request, response) => {
      response.writeHead(receivedRequests.length === 1 ? 500 : 200).end();
    };
    const events: TransferProgress[] = [];

    await wrapper.upload(reference, content, undefined, undefined, {
      onProgress: (progress) => events.push(progress),
    });

    expect(receivedRequests).to.have.length(2);
    receivedRequests.forEach((request) => {
      expect(request.contentLength).to.equal(content.byteLength.toString());
      expect(request.body.equals(content)).to.be.true;
    });
    const restartIndex = events.findIndex(
      (event, i) => i > 0 && event.loadedBytes === 0
    );
    expect(restartIndex).to.be.greaterThan(0);
    expectNonDecreasing(events.slice(restartIndex));
    expect(events[events.length - 1].loadedBytes).to.equal(content.byteLength);
  });

  it("should reject with AbortError if signal is already aborted", async () => {
    const abortController = new AbortController();
    abortController.abort();

    await expect(
      wrapper.upload(reference, content, undefined, undefined, {
        abortSignal: abortController.signal,
        onProgress: () => {},
      })
    ).to.be.rejected.and.eventually.have.property("name", "AbortError");
    expect(requestCount).to.equal(0);
  });

  it("should reject with AbortError if aborted while sending body", async () => {
    const abortController = new AbortController();
    onRequest = (request) =>
      request.once("data", () => abortController.abort());

    await expect(
      wrapper.upload(reference, content, undefined, undefined, {
        abortSignal: abortController.signal,
        onProgress: () => {},
      })
    ).to.be.rejected.and.eventually.have.property("name", "AbortError");
    expect(requestCount).to.equal(1);
  });
});
