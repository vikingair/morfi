import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      morfi: __dirname + "/src",
    },
  },
  test: {
    setupFiles: "./test/setupTests.ts",
    environment: "jsdom",
    watch: false,
    coverage: {
      include: ["src"],
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 100,
      },
      reporter: ["text-summary", "lcov", "html"],
      provider: "v8",
    },
  },
});
