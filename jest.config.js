module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.expo-web-check/',
    '/.expo-web-test/',
    '/web/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
