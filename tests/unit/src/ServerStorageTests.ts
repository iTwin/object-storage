// /*---------------------------------------------------------------------------------------------
//  * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
//  * See LICENSE.md in the project root for license terms and full copyright notice.
//  *--------------------------------------------------------------------------------------------*/
// import { Readable } from "stream";

// import { ObjectReference, ServerStorage } from "@itwin/object-storage-core";

// import {
//   ErrorThrownTestCase,
//   testRelativeDirectoryValidation,
// } from "./CommonTests";

// const referenceWithInvalidRelativeDir: ObjectReference = {
//   baseDirectory: "testBaseDirectory",
//   relativeDirectory: "testDirectory1\\testDirectory2",
//   objectName: "testObjectName",
// };

// export async function testServerDownloadRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCases: ErrorThrownTestCase[] = [
//     {
//       workflowName: `${serverStorage.download.name} to buffer using transferConfig`,
//       functionUnderTest: async () =>
//         serverStorage.download(referenceWithInvalidRelativeDir, "buffer"),
//     },
//     {
//       workflowName: `${serverStorage.download.name} to stream using transferConfig`,
//       functionUnderTest: async () =>
//         serverStorage.download(referenceWithInvalidRelativeDir, "stream"),
//     },
//     {
//       workflowName: `${serverStorage.download.name} to path using transferConfig`,
//       functionUnderTest: async () =>
//         serverStorage.download(
//           referenceWithInvalidRelativeDir,
//           "local",
//           "testLocalPath"
//         ),
//     },
//   ];
//   return testRelativeDirectoryValidation(...testCases);
// }

// export async function testServerUploadRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCases: ErrorThrownTestCase[] = [
//     {
//       workflowName: `${serverStorage.upload.name} from path using transferConfig`,
//       functionUnderTest: async () =>
//         serverStorage.upload(referenceWithInvalidRelativeDir, "testPath"),
//     },
//     {
//       workflowName: `${serverStorage.upload.name} from Buffer using transferConfig`,
//       functionUnderTest: async () =>
//         serverStorage.upload(
//           referenceWithInvalidRelativeDir,
//           Buffer.from("testPayload")
//         ),
//     },
//     {
//       workflowName: `${serverStorage.upload.name} from Stream using transferConfig`,
//       functionUnderTest: async () =>
//         serverStorage.upload(
//           referenceWithInvalidRelativeDir,
//           Readable.from("testPayload")
//         ),
//     },
//   ];
//   return testRelativeDirectoryValidation(...testCases);
// }

// export async function testServerMultipartUploadRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCases: ErrorThrownTestCase[] = [
//     {
//       workflowName: `${serverStorage.uploadInMultipleParts.name} from path using transferConfig`,
//       functionUnderTest: async () =>
//         serverStorage.uploadInMultipleParts(
//           referenceWithInvalidRelativeDir,
//           "testPath"
//         ),
//     },
//     {
//       workflowName: `${serverStorage.uploadInMultipleParts.name} from Stream using transferConfig`,
//       functionUnderTest: async () =>
//         serverStorage.uploadInMultipleParts(
//           referenceWithInvalidRelativeDir,
//           Readable.from("testPayload")
//         ),
//     },
//   ];
//   return testRelativeDirectoryValidation(...testCases);
// }

// export async function testDeleteObjectRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCase: ErrorThrownTestCase = {
//     workflowName: serverStorage.deleteObject.name,
//     functionUnderTest: async () =>
//       serverStorage.deleteObject(referenceWithInvalidRelativeDir),
//   };
//   return testRelativeDirectoryValidation(testCase);
// }

// export async function testObjectExistsRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCase: ErrorThrownTestCase = {
//     workflowName: serverStorage.objectExists.name,
//     functionUnderTest: async () =>
//       serverStorage.objectExists(referenceWithInvalidRelativeDir),
//   };
//   return testRelativeDirectoryValidation(testCase);
// }

// export async function testUpdateMetadataRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCase: ErrorThrownTestCase = {
//     workflowName: serverStorage.updateMetadata.name,
//     functionUnderTest: async () =>
//       serverStorage.updateMetadata(referenceWithInvalidRelativeDir, {}),
//   };
//   return testRelativeDirectoryValidation(testCase);
// }

// export async function testGetObjectPropertiesRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCase: ErrorThrownTestCase = {
//     workflowName: serverStorage.getObjectProperties.name,
//     functionUnderTest: async () =>
//       serverStorage.getObjectProperties(referenceWithInvalidRelativeDir),
//   };
//   return testRelativeDirectoryValidation(testCase);
// }

// export async function testGetDownloadUrlRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCase: ErrorThrownTestCase = {
//     workflowName: serverStorage.getDownloadUrl.name,
//     functionUnderTest: async () =>
//       serverStorage.getDownloadUrl(referenceWithInvalidRelativeDir),
//   };
//   return testRelativeDirectoryValidation(testCase);
// }

// export async function testGetUploadUrlRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCase: ErrorThrownTestCase = {
//     workflowName: serverStorage.getUploadUrl.name,
//     functionUnderTest: async () =>
//       serverStorage.getUploadUrl(referenceWithInvalidRelativeDir),
//   };
//   return testRelativeDirectoryValidation(testCase);
// }

// export async function testGetDownloadConfigRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCase: ErrorThrownTestCase = {
//     workflowName: serverStorage.getDownloadConfig.name,
//     functionUnderTest: async () =>
//       serverStorage.getDownloadConfig(referenceWithInvalidRelativeDir),
//   };
//   return testRelativeDirectoryValidation(testCase);
// }

// export async function testGetUploadConfigRelativeDirValidation(
//   serverStorage: ServerStorage
// ): Promise<void> {
//   const testCase: ErrorThrownTestCase = {
//     workflowName: serverStorage.getUploadConfig.name,
//     functionUnderTest: async () =>
//       serverStorage.getUploadConfig(referenceWithInvalidRelativeDir),
//   };
//   return testRelativeDirectoryValidation(testCase);
// }
