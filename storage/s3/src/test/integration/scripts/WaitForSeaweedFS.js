/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const { HeadBucketCommand, S3Client } = require("@aws-sdk/client-s3");
const constants = require("./SeaweedFSConstants");

const timeoutMs = 30000;
const pollIntervalMs = 1000;

// `weed mini` opens the S3 port before it creates the buckets, so wait until
// every test bucket can be reached with the test credentials.
async function waitForSeaweedFS() {
  const client = new S3Client({
    endpoint: `http://${constants.host}:${constants.s3Port}`,
    region: constants.region,
    credentials: {
      accessKeyId: constants.accessKey,
      secretAccessKey: constants.secretKey,
    },
    maxAttempts: 1,
  });

  const deadline = Date.now() + timeoutMs;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let lastError;
  try {
    while (Date.now() < deadline) {
      try {
        for (const bucketName of constants.bucketNames)
          await client.send(new HeadBucketCommand({ Bucket: bucketName }), {
            abortSignal: controller.signal,
          });
        return;
      } catch (error) {
        lastError = error;
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) break;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(pollIntervalMs, remainingMs))
        );
      }
    }
    throw new Error(
      `SeaweedFS was not ready within ${timeoutMs} ms: ${lastError?.message}`
    );
  } finally {
    clearTimeout(timeout);
    client.destroy();
  }
}

waitForSeaweedFS().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
