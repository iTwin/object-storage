/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { expect } from "chai";

import {
  PresignedUrlProvider,
  TransferConfigProvider,
} from "@itwin/object-storage-core";

import { FrontendS3ClientWrapper } from "../../../frontend/wrappers";
import { S3ClientWrapper, S3ServerStorage } from "../../../server";

const bucket = "testBucket";

function createFakeClient(keys: string[]): {
  client: S3Client;
  remaining: Set<string>;
} {
  const remaining = new Set(keys);
  const client = {
    send: (command: unknown) => {
      if (command instanceof ListObjectsV2Command) {
        const prefix = command.input.Prefix ?? "";
        return Promise.resolve({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Contents: [...remaining]
            .filter((key) => key.startsWith(prefix))
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .map((key) => ({ Key: key })),
        });
      }
      if (command instanceof DeleteObjectCommand) {
        remaining.delete(command.input.Key!);
        return Promise.resolve({});
      }
      return Promise.reject(new Error("Unexpected command"));
    },
  } as unknown as S3Client;
  return { client, remaining };
}

describe("S3 directory isolation", () => {
  const keys = [
    "tenant-a/",
    "tenant-a/contract.pdf",
    "tenant-a/nested/file.bim",
    "tenant-ab/",
    "tenant-ab/contract.pdf",
    "tenant-a2/payroll.xlsx",
  ];
  const siblingKeys = keys.filter((key) => !key.startsWith("tenant-a/"));

  function createServerStorage(client: S3Client): S3ServerStorage {
    return new S3ServerStorage(
      new S3ClientWrapper(client, bucket),
      {} as PresignedUrlProvider,
      {} as TransferConfigProvider
    );
  }

  it("should not list objects of directories sharing a name prefix", async () => {
    const { client } = createFakeClient(keys);

    const objects = await createServerStorage(client).listObjects({
      baseDirectory: "tenant-a",
    });

    expect(objects.map((object) => object.baseDirectory)).to.deep.equal([
      "tenant-a",
      "tenant-a",
    ]);
  });

  it("should not delete objects of directories sharing a name prefix", async () => {
    const { client, remaining } = createFakeClient(keys);

    await createServerStorage(client).deleteBaseDirectory({
      baseDirectory: "tenant-a",
    });

    expect([...remaining]).to.have.members(siblingKeys);
  });

  it("should not report a directory as existing when only a sibling exists", async () => {
    const { client } = createFakeClient(["tenant-ab/contract.pdf"]);

    expect(
      await createServerStorage(client).baseDirectoryExists({
        baseDirectory: "tenant-a",
      })
    ).to.be.false;
  });

  it("should still report a directory created with a marker object", async () => {
    const { client } = createFakeClient(["tenant-a/"]);

    expect(
      await createServerStorage(client).baseDirectoryExists({
        baseDirectory: "tenant-a",
      })
    ).to.be.true;
  });

  it(`${FrontendS3ClientWrapper.name} should not list objects of directories sharing a name prefix`, async () => {
    const { client } = createFakeClient(keys);

    const objects = await new FrontendS3ClientWrapper(client, bucket).list({
      baseDirectory: "tenant-a",
    });

    expect(objects.map((object) => object.baseDirectory)).to.deep.equal([
      "tenant-a",
      "tenant-a",
    ]);
  });
});
