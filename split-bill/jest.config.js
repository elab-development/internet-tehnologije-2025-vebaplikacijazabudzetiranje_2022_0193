const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  testEnvironment: 'jest-environment-jsdom',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
  ],

  coverageThreshold: {
    global: {
      branches: 4,
      functions: 4,
      lines: 4,
      statements: 4,
    },
  },

  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

// Wrap createJestConfig to override transformIgnorePatterns after Next.js sets its defaults
const jestConfigFn = createJestConfig(customJestConfig);
module.exports = async () => {
  const config = await jestConfigFn();
  config.transformIgnorePatterns = [
    '/node_modules/(?!@exodus/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ];
  return config;
};
