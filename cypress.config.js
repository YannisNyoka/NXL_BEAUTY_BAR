const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.spec.js',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
      return config;
    },
    // Don't fail on 404s since S3 static hosting returns 404 for client-side routes
    failOnStatusCode: false
  },
  video: false,
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  // Configure retries for more stable tests
  retries: {
    runMode: 2,
    openMode: 0
  },
});
