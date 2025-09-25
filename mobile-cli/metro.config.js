const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */

const config = {
  watchFolders: [
    path.resolve(__dirname, '../shared'), // Include shared types
  ],
  resolver: {
    extraNodeModules: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);