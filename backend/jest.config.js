module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        // These settings help with decorator issues
        isolatedModules: true,
        diagnostics: {
          ignoreCodes: [
            1343, // Class decorator
            1344, // Property decorator
            1345, // Method decorator
            1240, // Unable to resolve signature of property decorator
            1241, // Unable to resolve signature of method decorator
            2307, // Cannot find module
            2749, // Cannot find namespace
          ],
        },
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
  },
};
