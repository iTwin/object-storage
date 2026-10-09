/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const child_process = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const constants = require("./SeaweedFSConstants");
const { directOutputToConsole } = require(path.join(
  "..",
  "..",
  "..",
  "..",
  "node_modules",
  "@itwin",
  "object-storage-common-config",
  "scripts",
  "Common.js"
));

const bucketPolicyName = "integration-test-bucket-access";

function createS3Config() {
  return {
    identities: [
      {
        name: constants.identityName,
        credentials: [
          { accessKey: constants.accessKey, secretKey: constants.secretKey },
        ],
        actions: ["Admin", "Read", "List", "Tagging", "Write"],
      },
    ],
  };
}

function createIamConfig() {
  const bucketResources = constants.bucketNames.flatMap((bucketName) => [
    `arn:aws:s3:::${bucketName}`,
    `arn:aws:s3:::${bucketName}/*`,
  ]);

  return {
    sts: {
      tokenDuration: "1h",
      maxSessionLength: "12h",
      issuer: "seaweed-integration-test-sts",
      // A fresh key per run; sessions never outlive the server process.
      signingKey: crypto.randomBytes(32).toString("base64"),
    },
    // Requests made with STS credentials must be allowed by both the role's
    // policies and the session policy minted by S3TransferConfigProvider.
    policy: { defaultEffect: "Deny" },
    roles: [
      {
        roleName: constants.roleName,
        roleArn: constants.roleArn,
        trustPolicy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: "*" },
              Action: ["sts:AssumeRole"],
            },
          ],
        },
        attachedPolicies: [bucketPolicyName],
      },
    ],
    policies: [
      {
        name: bucketPolicyName,
        document: {
          Version: "2012-10-17",
          Statement: [
            { Effect: "Allow", Action: ["s3:*"], Resource: bucketResources },
          ],
        },
      },
    ],
  };
}

function writeJson(filePath, content) {
  fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
}

function runSeaweedFS() {
  // Start from an empty server so that every run sees the same state.
  fs.rmSync(constants.seaweedFSDataDirectory, { recursive: true, force: true });
  fs.rmSync(constants.seaweedFSConfigDirectory, {
    recursive: true,
    force: true,
  });
  fs.mkdirSync(constants.seaweedFSDataDirectory, { recursive: true });
  fs.mkdirSync(constants.seaweedFSConfigDirectory, { recursive: true });

  const s3ConfigPath = path.join(constants.seaweedFSConfigDirectory, "s3.json");
  const iamConfigPath = path.join(
    constants.seaweedFSConfigDirectory,
    "iam.json"
  );
  writeJson(s3ConfigPath, createS3Config());
  writeJson(iamConfigPath, createIamConfig());

  // Keep `weed mini` from creating an extra identity from the environment.
  const environment = { ...process.env };
  delete environment.AWS_ACCESS_KEY_ID;
  delete environment.AWS_SECRET_ACCESS_KEY;
  delete environment.S3_BUCKET;

  const { executablePath } = constants.resolveReleaseAsset();
  const childProcess = child_process.spawn(
    executablePath,
    [
      "mini",
      `-dir=${constants.seaweedFSDataDirectory}`,
      `-ip=${constants.host}`,
      `-ip.bind=${constants.host}`,
      `-s3.port=${constants.s3Port}`,
      `-s3.config=${s3ConfigPath}`,
      `-s3.iam.config=${iamConfigPath}`,
      `-bucket=${constants.bucketNames.join(",")}`,
      `-s3.allowedOrigins=${constants.frontendTestOrigin}`,
      "-s3.port.iceberg=0",
      "-s3.port.lance=0",
      // cspell:ignore webdav
      "-webdav=false",
      "-admin.ui=false",
      "-master.telemetry=false",
    ],
    { env: environment }
  );

  directOutputToConsole(childProcess);
  childProcess.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
}

runSeaweedFS();
