const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  ...config.resolver.blockList,
  /\/\.local\/.*/,
  /\/node_modules\/\.pnpm\/.*_tmp_\d+\/.*/,
];

module.exports = config;
