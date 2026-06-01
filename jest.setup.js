jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-image', () => {
  const React = require('react');
  const { Image } = require('react-native');

  return {
    Image: ({ source, style, ...props }) => React.createElement(Image, {
      source,
      style,
      ...props,
    }),
  };
});
