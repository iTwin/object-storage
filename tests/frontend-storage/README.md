# @itwin/object-storage-tests-frontend

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About this package

This package contains a framework for testing different `FrontendStorage` implementations in browser environment.

### Workflow

Test launch workflow:
1. Generate a script that will be loaded by integration tests to create an instance of storage class under test.
    1. Define a script that sets the `window.frontendStorage` property to an instance of frontend storage implementation.
    1. Transpile the script from TS to JS.
    1. Bundle the script using `webpack` to include all of its dependencies. 
1. Start a web server that will be used by the tests to get object access information.
    1. Construct an instance of `BackendStorageServer` and bind an implementation of `ServerStorage` to its `container`.
    1. Start the configured server by calling `BackendStorageServer.start` on the constructed instance.
1. Construct an instance of `FrontendStorageIntegrationTests` and pass the path of the bundled script as a constructor argument.
1. Start the tests by calling `FrontendStorageIntegrationTests.start` on the test class instance which:
    1. Copies the bundled storage setting script into a location that `cypress` can access.
    1. Launches cypress with a specific configuration.

### TS compiler configuration files

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

### Useful links:

- Cypress Node API: https://docs.cypress.io/guides/guides/module-api
- Cypress TS support: https://docs.cypress.io/guides/tooling/typescript-support
