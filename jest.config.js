module.exports = {
    collectCoverageFrom: ['src/**/*.js'],
    testMatch: ['<rootDir>/test/**/*.js'],
    setupFilesAfterEnv: ['<rootDir>/test_resources/setupTests.js'],
    coverageThreshold: { global: { statements: 100, branches: 100, functions: 100, lines: 100 } },
    coverageDirectory: '<rootDir>/build/coverage',
    coverageReporters: ['lcov', 'text'],
    moduleNameMapper: { '\\.(scss)$': 'identity-obj-proxy', '(.*)/(dist/cjs/)': '$1/src/' },
};
