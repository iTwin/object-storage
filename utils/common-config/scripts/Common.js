/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
function listenTo(readable, dataCallback) {
  if (readable) {
    readable.setEncoding("utf8");
    readable.on("data", dataCallback);
  }
}

function directOutputToConsole(childProcess) {
  if (childProcess.stdout)
    listenTo(childProcess.stdout, (data) => {
      // eslint-disable-next-line no-console
      console.log(data);
    });
  if (childProcess.stderr)
    listenTo(childProcess.stderr, (data) => {
      // eslint-disable-next-line no-console
      console.error(data);
    });
}

module.exports = {
  directOutputToConsole
};
