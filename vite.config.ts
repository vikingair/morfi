import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// TODO: Integrate coveralls again via GitHub workflow: TODO: https://github.com/marketplace/actions/coveralls-github-action

const entryName = process.env.TEST_UTIL ? 'src/test-utils/index.tsx' : 'src/index.tsx';
const outputDir = process.env.TEST_UTIL ? 'dist/test-utils' : 'dist';
const emptyOutDir = !process.env.TEST_UTIL;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        emptyOutDir,
        lib: {
            formats: ['cjs', 'es'],
            entry: resolve(__dirname, entryName),
            fileName: (format) => (format === 'cjs' ? 'index.cjs' : 'index.mjs'),
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['react', '@testing-library/react', '../'],
            output: {
                dir: outputDir,
            },
        },
    },
});
