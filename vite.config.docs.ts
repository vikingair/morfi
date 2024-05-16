import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/morfi/",
  root: "docs",
  server: {
    port: 3333,
    strictPort: true,
  },
  define: {
    "process.env": {
      NODE_ENV: process.env.NODE_ENV,
    },
  },
  resolve: {
    alias: {
      morfi: __dirname + "/src",
    },
  },
  build: {
    outDir: "../build",
    emptyOutDir: true,
    sourcemap: true, // build "*.map" files for JS sources
    manifest: false, // create a manifest.json for further processing of generated assets
  },
});
