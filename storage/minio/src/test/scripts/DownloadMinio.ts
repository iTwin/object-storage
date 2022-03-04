/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import * as fs from "fs";
import * as https from "https";

import { resolveFileProperties } from "./MinioConstants";

function downloadMinioExecutable(): void {
  const { executableDownloadLink, targetFilePath } = resolveFileProperties();
  const destinationFile = fs.createWriteStream(targetFilePath);
  https.get(executableDownloadLink, (response) => {
    response.pipe(destinationFile);
  });
}

downloadMinioExecutable();
