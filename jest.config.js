module.exports = {
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    testMatch: ['<rootDir>/test/**/*.{ts,tsx}'],
    coverageThreshold: { global: { statements: 100, branches: 100, functions: 100, lines: 100 } },
    coverageDirectory: '<rootDir>/build/coverage',
    coverageReporters: ['lcov', 'text'],
    transform: { "\\.(js|jsx|ts|tsx)$": "@sucrase/jest-plugin" },
    moduleNameMapper: { '\\.(scss)$': 'identity-obj-proxy', '(.*)/(dist/cjs/)': '$1/src/' },
};
