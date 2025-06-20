module.exports = {
  globalSetup: '<rootDir>/jest-prisma-generate.js',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  setupFiles: ['<rootDir>/jest-reflect-metadata-setup.ts'],
  
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  unmockedModulePathPatterns: [
    'reflect-metadata',
  ],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        diagnostics: false,
        isolatedModules: false,
        compiler: 'typescript',
        // These settings help with decorator issues
        /* diagnostics: {
          ignoreCodes: [
            1343, // Class decorator
            1344, // Property decorator
            1345, // Method decorator
            1240, // Unable to resolve signature of property decorator
            1241, // Unable to resolve signature of method decorator
            2307, // Cannot find module
            2749, // Cannot find namespace
          ],
        }, */
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^bullmq$': '<rootDir>/../node_modules/bullmq'
  },
  moduleDirectories: ['node_modules', '../node_modules'],
  modulePaths: ['<rootDir>/node_modules', '<rootDir>/../node_modules'],
};
