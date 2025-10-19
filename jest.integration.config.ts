import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/infrastructure/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/infrastructure/setup/jest.setup.ts'],
  globalSetup: '<rootDir>/test/infrastructure/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/infrastructure/setup/global-teardown.ts',
  testTimeout: 60000, 
  maxWorkers: 1,
  collectCoverageFrom: ['src/infrastructure/**/*.ts', '!src/infrastructure/**/*.d.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  verbose: true,
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default config;
