const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add shared folder to watched folders
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
];

// Add shared folder to resolver
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../shared'),
];

module.exports = config;