import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'integration/**/*.test.ts'],
    exclude: ['dist', 'node_modules', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/index.ts',
        'src/verify/harness/runner.ts',
      ],
      thresholds: {
        lines: 85,
        functions: 90,
        branches: 75,
        statements: 85,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
