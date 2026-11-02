/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";
import { expect } from "chai";

import { ObjectDirectory } from "@itwin/object-storage-core";

import { S3TransferConfigProvider, StsWrapper } from "../../../server";

interface PolicyStatement {
  Effect: string;
  Action: string | string[];
  Resource: string | string[];
  Condition?: { [operator: string]: { [key: string]: string | string[] } };
}

const bucket = "testBucket";
const bucketArn = `arn:aws:s3:::${bucket}`;

function toArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

async function getIssuedPolicy(
  directory: ObjectDirectory
): Promise<PolicyStatement[]> {
  let policy: string | undefined;
  const stsClient = {
    send: (command: unknown) => {
      if (!(command instanceof AssumeRoleCommand))
        return Promise.reject(new Error("Unexpected command"));
      policy = command.input.Policy;
      return Promise.resolve({
        /* eslint-disable @typescript-eslint/naming-convention */
        Credentials: {
          AccessKeyId: "accessKey",
          SecretAccessKey: "secretKey",
          SessionToken: "sessionToken",
          Expiration: new Date(),
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      });
    },
  } as unknown as STSClient;

  await new S3TransferConfigProvider(new StsWrapper(stsClient), {
    bucket,
    roleArn: "arn:aws:iam::role/test-role",
  } as ConstructorParameters<typeof S3TransferConfigProvider>[1]).getDirectoryAccessConfig(
    directory
  );

  return (JSON.parse(policy!) as { Statement: PolicyStatement[] }).Statement;
}

describe(`${S3TransferConfigProvider.name}.getDirectoryAccessConfig() policy`, () => {
  const directories: { name: string; directory: ObjectDirectory }[] = [
    { name: "base directory", directory: { baseDirectory: "tenant-a" } },
    {
      name: "relative directory",
      directory: { baseDirectory: "tenant-a", relativeDirectory: "sub" },
    },
  ];

  directories.forEach(({ name, directory }) => {
    const directoryPath = directory.relativeDirectory
      ? `${directory.baseDirectory}/${directory.relativeDirectory}`
      : directory.baseDirectory;

    describe(name, () => {
      it("should not allow s3:ListBucket on the bucket without an s3:prefix condition", async () => {
        const statements = await getIssuedPolicy(directory);

        const unrestrictedListStatements = statements.filter(
          (statement) =>
            statement.Effect === "Allow" &&
            toArray(statement.Action).includes("s3:ListBucket") &&
            toArray(statement.Resource).includes(bucketArn) &&
            !statement.Condition?.StringLike?.["s3:prefix"]
        );

        expect(unrestrictedListStatements).to.have.lengthOf(0);
      });

      it("should restrict s3:ListBucket to the requested directory prefix", async () => {
        const statements = await getIssuedPolicy(directory);

        const listStatements = statements.filter(
          (statement) =>
            statement.Effect === "Allow" &&
            toArray(statement.Action).includes("s3:ListBucket")
        );
        expect(listStatements).to.not.be.empty;

        listStatements.forEach((statement) => {
          expect(toArray(statement.Resource)).to.deep.equal([bucketArn]);
          expect(
            toArray(statement.Condition!.StringLike["s3:prefix"])
          ).to.have.members([`${directoryPath}/`, `${directoryPath}/*`]);
        });
      });

      it("should keep object actions scoped to the directory", async () => {
        const statements = await getIssuedPolicy(directory);

        const objectStatements = statements.filter((statement) =>
          toArray(statement.Action).some((action) =>
            ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"].includes(action)
          )
        );
        expect(objectStatements).to.not.be.empty;

        objectStatements.forEach((statement) => {
          expect(toArray(statement.Resource)).to.deep.equal([
            `${bucketArn}/${directoryPath}/*`,
          ]);
        });
      });
    });
  });
});
