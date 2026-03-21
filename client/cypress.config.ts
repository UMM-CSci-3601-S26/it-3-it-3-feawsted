import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./cypress/plugins/index.ts').default(on, config);
    },
  },
});
