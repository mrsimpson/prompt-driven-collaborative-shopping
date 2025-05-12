// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const jestPlugin = require("eslint-plugin-jest");
const eslintConfigPrettier = require("eslint-config-prettier/flat");

module.exports = defineConfig([
  {
    ignores: ["**/dist/**", "dist/**"],
  },
  expoConfig,
  {
    plugins: {
      jest: jestPlugin,
    },
    // Include Jest recommended rules
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
  eslintConfigPrettier,
]);
