# @itwin/object-storage-tests-frontend

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About this package

This package contains a small framework for testing different `FrontendStorage` implementations in browser environment.

### Configuration

### TS compiler configuration
```
.
|-- cypress
|   |-- tsconfig.json (1)
|-- backend.tsconfig.json (2)
|-- tsconfig.json (3)
```

1. `tsconfig.json` in `cypress` directory is used by `cypress` framework to transpile test and test helper files when running tests.
1. `backend.tsconfig.json` is used to transpile test running utilities that are imported by other CommonJS modules (storage packages).
1. `tsconfig.json` in root directory is only used to reference typings so that VS Code would not highlight the code as incorrect.

Useful links:
- Cypress Node API: https://docs.cypress.io/guides/guides/module-api
- Cypress TS support: https://docs.cypress.io/guides/tooling/typescript-support
