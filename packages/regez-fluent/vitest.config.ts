import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'regez-fluent',
    coverage: {
      provider: 'v8',
    },
  },
});
