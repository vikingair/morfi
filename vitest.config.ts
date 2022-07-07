import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: './test/setupTests.ts',
        environment: 'jsdom',
        watch: false,
        coverage: {
            reporter: ['text-summary', 'lcov', 'html'],
            lines: 100,
            functions: 100,
            statements: 100,
            branches: 100,
        },
    },
});
