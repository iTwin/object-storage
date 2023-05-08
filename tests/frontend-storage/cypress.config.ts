export default {
  browser: "chrome",
  fixturesFolder: false,
  screenshotsFolder: false,
  video: false,
  defaultCommandTimeout: 30000,
  e2e: {
	specPattern: "cypress/integration/**.test.ts"
  }
};
