import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'
import axios from 'axios'

export default defineConfig({
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
  downloadsFolder: 'tests/e2e/downloads',
  e2e: {
    baseUrl: 'http://localhost:8080',
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents (on) {
      on('task', {
        async 'db:reset' () {
          await axios.get('http://localhost:4042/_reset')
          return true
        },
      })
      on('file:preprocessor', vitePreprocessor())
    },
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/index.ts',
  },
})
