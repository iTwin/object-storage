export default {
  browser: "chrome",
  fixturesFolder: false,
  screenshotOnRunFailure: false,
  video: false,
  defaultCommandTimeout: 30000,
  e2e: {
    specPattern: "cypress/integration/**.test.ts"
  }
};
