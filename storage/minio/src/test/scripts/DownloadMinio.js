/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
const fs = require("fs");
const https = require("https");
const constants = require("./MinioConstants");

function downloadMinioExecutable() {
  const { executableDownloadLink, targetFilePath } = constants.resolveFileProperties();
  const destinationFile = fs.createWriteStream(targetFilePath);
  https.get(executableDownloadLink, (response) => {
    response.pipe(destinationFile);
  });
}

downloadMinioExecutable();
