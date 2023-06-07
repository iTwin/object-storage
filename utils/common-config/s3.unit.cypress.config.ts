/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { defineConfig } from "cypress"
import * as webpackPreprocessor from "@cypress/webpack-batteries-included-preprocessor";
import baseConfig from "./unit.cypress.config";

export default defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    setupNodeEvents(on, _) {
      on(
        "file:preprocessor",

        // The preprocessing is needed because AWS SDK dependency uses null coalesce operator in its code
        // and by default cypress is not able to process that file.
        // /common/temp/node_modules/.pnpm/@aws-sdk+signature-v4@3.347.0/node_modules/@aws-sdk/signature-v4/dist-es/getCanonicalHeaders.js
        // |         const canonicalHeaderName = headerName.toLowerCase();
        // |         if (canonicalHeaderName in ALWAYS_UNSIGNABLE_HEADERS ||
        // >             unsignableHeaders?.has(canonicalHeaderName) ||
        // |             PROXY_HEADER_PATTERN.test(canonicalHeaderName) ||
        // |             SEC_HEADER_PATTERN.test(canonicalHeaderName)) {

        // @aws-sdk/signature-v4 dependency comes from @aws-sdk/client-s3: @aws-sdk/client-s3 -> @aws-sdk/middleware-signing -> @aws-sdk/signature-v4
        webpackPreprocessor()
      );
    }
  }
})