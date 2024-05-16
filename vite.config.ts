import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// TODO: Integrate coveralls again via GitHub workflow: https://github.com/marketplace/actions/coveralls-github-action

const entryName = process.env.TEST_UTIL
  ? "test-utils/index.tsx"
  : "src/index.tsx";
const outputDir = process.env.TEST_UTIL ? "test-utils/dist" : "dist";
// There is currently a Vite bug that would clear the wrong dir
const emptyOutDir = !process.env.TEST_UTIL;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir,
    lib: {
      formats: ["cjs", "es"],
      entry: resolve(__dirname, entryName),
      fileName: (format) => `index.${format}.js`,
    },
    // library code should not be minified according to this article
    // https://stackoverflow.com/a/48673965/15090924
    minify: false,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react", "@testing-library/react", "morfi"],
      output: {
        dir: outputDir,
      },
    },
  },
});
