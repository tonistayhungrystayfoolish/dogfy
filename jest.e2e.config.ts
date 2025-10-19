import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/e2e/**/*.e2e.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/infrastructure/setup/jest.setup.ts'],
  globalSetup: '<rootDir>/test/infrastructure/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/infrastructure/setup/global-teardown.ts',
  testTimeout: 30000,
  maxWorkers: 1,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/main.ts', '!src/**/index.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  clearMocks: true,
  verbose: true,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        useESM: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: [],
};

export default config;
