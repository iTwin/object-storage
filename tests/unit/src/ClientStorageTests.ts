/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientStorage, ObjectReference, TransferConfig } from "@itwin/object-storage-core";
import { Readable } from "stream";
import { ErrorThrownTestCase, testRelativeDirectoryValidation } from "./CommonTests";

const referenceWithInvalidRelativeDir: ObjectReference = {
  baseDirectory: "testBaseDirectory",
  relativeDirectory: "testDirectory1\\testDirectory2",
  objectName: "testObjectName"
};

export async function testClientDownloadRelativeDirValidation(
  clientStorage: ClientStorage,
  transferConfig: TransferConfig
): Promise<void> {
  const commonParams = {
    reference: referenceWithInvalidRelativeDir,
    transferConfig
  };
  const testCases: ErrorThrownTestCase[] = [
    {
      workflowName: `${clientStorage.download.name} to buffer using transferConfig`,
      functionUnderTest: () => clientStorage.download({
        transferType: "buffer",
        ...commonParams
      })
    },
    {
      workflowName: `${clientStorage.download.name} to stream using transferConfig`,
      functionUnderTest: () => clientStorage.download({
        transferType: "stream",
        ...commonParams
      })
    },
    {
      workflowName: `${clientStorage.download.name} to path using transferConfig`,
      functionUnderTest: () => clientStorage.download({
        transferType: "local",
        localPath: "testLocalPath",
        ...commonParams
      })
    }
  ];
  testRelativeDirectoryValidation(...testCases);
}

export async function testClientUploadRelativeDirValidation(
  clientStorage: ClientStorage,
  transferConfig: TransferConfig
): Promise<void> {
  const commonParams = {
    reference: referenceWithInvalidRelativeDir,
    transferConfig
  };
  const testCases: ErrorThrownTestCase[] = [
    {
      workflowName: `${clientStorage.upload.name} from path using transferConfig`,
      functionUnderTest: () => clientStorage.upload({
        data: "testPath",
        ...commonParams
      })
    },
    {
      workflowName: `${clientStorage.upload.name} from Buffer using transferConfig`,
      functionUnderTest: () => clientStorage.upload({
        data: Buffer.from("testPayload"),
        ...commonParams
      })
    },
    {
      workflowName: `${clientStorage.upload.name} from Stream using transferConfig`,
      functionUnderTest: () => clientStorage.upload({
        data: Readable.from("testPayload"),
        ...commonParams
      })
    }
  ];
  testRelativeDirectoryValidation(...testCases);
}

export async function testClientMultipartUploadRelativeDirValidation(
  clientStorage: ClientStorage,
  transferConfig: TransferConfig
): Promise<void> {
  const commonParams = {
    reference: referenceWithInvalidRelativeDir,
    transferConfig
  };
  const testCases: ErrorThrownTestCase[] = [
    {
      workflowName: `${clientStorage.uploadInMultipleParts.name} from path using transferConfig`,
      functionUnderTest: () => clientStorage.uploadInMultipleParts({
        data: "testPath",
        ...commonParams
      })
    },
    {
      workflowName: `${clientStorage.uploadInMultipleParts.name} from Stream using transferConfig`,
      functionUnderTest: () => clientStorage.uploadInMultipleParts({
        data: Readable.from("testPayload"),
        ...commonParams
      })
    }
  ];
  testRelativeDirectoryValidation(...testCases);
}

