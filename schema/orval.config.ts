import { defineConfig } from 'orval';

export default defineConfig({
  auth: {
    output: {
      mode: 'single',
      target: '../src/adapters/generated/auth.ts',
      mock: true,
      override: {
        mutator: {
          path: '../src/adapters/axios.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: './auth/openapi.yaml',
    },
  },
  files: {
    output: {
      mode: 'single',
      target: '../src/adapters/generated/files.ts',
      mock: true,
      override: {
        mutator: {
          path: '../src/adapters/axios.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: './files/openapi.yaml',
    },
  },
});
