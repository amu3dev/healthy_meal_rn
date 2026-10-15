module.exports = {
  extends: 'expo',
  ignorePatterns: ['/node_modules', '/ios', '/android', '/.expo', '/docs'],
  overrides: [
    {
      files: ['__tests__/**/*.js', 'jest.setup.js'],
      env: { jest: true },
    },
  ],
};
