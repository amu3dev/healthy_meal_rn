module.exports = {
  preset: 'react-native',
  watchman: false,
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|react-native|@react-navigation|react-native-safe-area-context|@testing-library/react-native)/)',
  ],
};
