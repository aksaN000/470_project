// Jest Configuration for MemeStack Backend Testing
// Configures test environment for API and database testing

module.exports = {
    // Test environment
    testEnvironment: 'node',
    
    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/__tests__/**/*.test.js'
    ],
    
    // Coverage settings
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'controllers/**/*.js',
        'models/**/*.js',
        'routes/**/*.js',
        'middleware/**/*.js',
        'utils/**/*.js',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/tests/**'
    ],
    
    // Setup and teardown
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Module resolution
    modulePathIgnorePatterns: ['<rootDir>/uploads/'],
    
    // Test timeout
    testTimeout: 30000,
    
    // Verbose output
    verbose: true,
    
    // Force exit to prevent hanging
    forceExit: true,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Reset modules between tests
    resetModules: true
};
