module.exports = {
  extends: 'expo',
  ignorePatterns: ['/node_modules', '/ios', '/android', '/.expo', '/docs'],
  rules: {
    'react-hooks/set-state-in-effect': 'off',
  },
  overrides: [
    {
      files: ['__tests__/**/*.js', 'jest.setup.js'],
      env: { jest: true },
    },
  ],
};
