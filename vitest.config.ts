// vite.st-config.ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    // Enable global test helpers (e.g., describe, it, expect)
    globals: true,
    // Use jsdom for React component rendering
    environment: "jsdom",
    // Optional setup file – can contain global imports or mocks
    // setupFiles: ['./vitest.setup.ts'],
    // Pattern to locate test files
    include: ["app/**/*.test.{ts,tsx}", "app/**/*.spec.{ts,tsx}"],
    // Exclude build output and dependencies
    exclude: ["node_modules", "dist"],
    // Coverage configuration
    coverage: {
      provider: "istanbul",
      reporter: ["json", "lcov", "text"],
      reportsDirectory: "coverage",
    },
  },
  // Resolve TS path aliases defined in tsconfig.json
  plugins: [tsconfigPaths()],
});
