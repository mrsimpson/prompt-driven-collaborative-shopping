// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const jestPlugin = require('eslint-plugin-jest');

module.exports = defineConfig([
  {
    // Explicitly ignore all files in the dist directory
    ignores: ["**/dist/**", "dist/**"]
  },
  expoConfig,
  {
    plugins: {
      jest: jestPlugin
    },
    // Include Jest recommended rules
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error'
    }
  }
]);
