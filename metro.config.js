const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project root directory
const projectRoot = __dirname;

// Create the default Metro config
const config = getDefaultConfig(projectRoot);

// Add support for TypeScript path aliases
config.resolver.extraNodeModules = new Proxy({}, {
  get: (target, name) => {
    if (name === '@') {
      return path.resolve(projectRoot);
    }
    return path.join(process.cwd(), `node_modules/${name}`);
  },
});

// Add support for resolving from the root directory
config.watchFolders = [path.resolve(__dirname)];

module.exports = config;
