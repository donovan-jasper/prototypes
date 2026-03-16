module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testMatch: [
    '**/__tests__/**/*.test.(js|jsx|ts|tsx)',
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
};
